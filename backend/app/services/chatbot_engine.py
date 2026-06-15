"""
Core Chatbot Engine — LangGraph Multi-Agent Pipeline
StateGraph routes: Language Detect -> Intent Agent -> Context Agent -> Response Agent
"""
import time
import logging
from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from typing_extensions import TypedDict

logger = logging.getLogger(__name__)

try:
    from langgraph.graph import StateGraph, START, END
    from langchain_groq import ChatGroq
    from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
    LANGGRAPH_AVAILABLE = True
except Exception as exc:
    StateGraph = None
    START = END = None
    ChatGroq = None
    HumanMessage = SystemMessage = AIMessage = None
    LANGGRAPH_AVAILABLE = False
    logger.warning(f"LangGraph stack unavailable, using fallback mode: {exc}")

from app.services.translation_service import detect_language, translate_to_english, translate_from_english
from app.services.moderation import moderate
from app.services.action_handlers import get_handler

@dataclass
class ChatResponse:
    response: str
    intent: str
    confidence: float
    language: str
    response_time_ms: int
    pii_found: list
    entities: dict
    llm_used: bool = False

# Define our LangGraph State
class AgentState(TypedDict):
    original_message: str
    translated_message: str
    history: List[dict]
    language: str
    intent: str
    confidence: float
    entities: Dict[str, Any]
    context: str
    final_response_en: str
    pii_found: List[str]
    is_safe: bool
    moderation_reason: str


# -- LangGraph Nodes --

def node_moderate(state: AgentState) -> AgentState:
    """Check safety and extract PII"""
    mod_result = moderate(state["original_message"])
    state["is_safe"] = mod_result["safe"]
    state["moderation_reason"] = mod_result.get("reason", "")
    state["pii_found"] = mod_result["pii_found"]
    
    if state["is_safe"]:
        # Translate to english
        state["translated_message"] = translate_to_english(mod_result["masked_text"], source_lang=state["language"])
    else:
        state["final_response_en"] = "⚠️ Request blocked by safety policy."
    return state


async def node_intent(state: AgentState) -> AgentState:
    """Agent 1: Classify Intent using Groq LLM"""
    from app.config import get_settings
    settings = get_settings()

    if not settings.groq_api_key:
        # Fallback to rule-based if no API key
        from app.services.intent_classifier import classify_intent
        res = classify_intent(state["translated_message"])
        state["intent"] = res.intent
        state["confidence"] = res.confidence
        state["entities"] = res.entities
        return state

    try:
        from app.config import get_settings
        settings = get_settings()

        if settings.groq_api_key:
            llm = ChatGroq(api_key=settings.groq_api_key, model="llama3-8b-8192", temperature=0.1)
        else:
            # Fallback to local Ollama if Groq is not configured
            from langchain_community.chat_models import ChatOllama
            llm = ChatOllama(model="llama3", temperature=0.1)

        prompt = f"""Classify the intent of this blue-collar job query.
Possible intents: find_worker, check_salary, register_worker, check_availability, job_status, payment_issue, dispute, emergency, general.
Extract any locations (city, state) or designations.
Reply ONLY with a JSON dictionary containing 'intent', 'confidence' (0.0-1.0), and 'entities'.
Query: "{state["translated_message"]}"
"""
        res = await llm.ainvoke([HumanMessage(content=prompt)])
        import json, re
        match = re.search(r"\{.*\}", res.content, re.DOTALL)
        if match:
            data = json.loads(match.group())
            state["intent"] = data.get("intent", "general")
            state["confidence"] = float(data.get("confidence", 0.5))
            state["entities"] = data.get("entities", {})
        else:
            state["intent"] = "general"
            state["confidence"] = 0.5
            state["entities"] = {}
    except Exception as e:
        logger.error(f"Intent LLM failed: {e}")
        state["intent"] = "general"
        state["confidence"] = 0.1
        state["entities"] = {}
    return state


async def node_context(state: AgentState) -> AgentState:
    """Agent 2: Fetch context from vector DB or action handlers"""
    intent = state.get("intent", "general")
    if state.get("confidence", 0) >= 0.3 and intent != "general":
        try:
            handler = get_handler(intent)
            # Use handler to get context/response string
            context_str = handler(state["entities"], lang="en")
            state["context"] = context_str
        except Exception as e:
            state["context"] = ""
    else:
        state["context"] = "No specific context available."
    return state


async def node_response(state: AgentState) -> AgentState:
    """Agent 3: Format the final response"""
    from app.config import get_settings
    settings = get_settings()

    if not settings.groq_api_key:
        state["final_response_en"] = state.get("context", "I can help with job queries. Please configure an API key for full AI capabilities.")
        return state

    try:
        from app.config import get_settings
        settings = get_settings()

        if settings.groq_api_key:
            llm = ChatGroq(api_key=settings.groq_api_key, model="llama3-70b-8192", temperature=0.7)
        else:
            # Fallback to local Ollama if Groq is not configured
            from langchain_community.chat_models import ChatOllama
            llm = ChatOllama(model="llama3", temperature=0.7)

        sys_msg = SystemMessage(content="You are Sahayak, an AI assistant for a blue-collar job marketplace in India. Be concise, helpful, and friendly (max 150 words). Include emojis.")
        
        # Build prompt
        hist_msgs = []
        for h in state.get("history", [])[-4:]:
            if h["role"] == "user":
                hist_msgs.append(HumanMessage(content=h["content"]))
            else:
                hist_msgs.append(AIMessage(content=h["content"]))
                
        user_msg = HumanMessage(content=f"User query: {state['translated_message']}\nSystem Context: {state.get('context', '')}\nProvide a helpful response to the user query based on the system context.")
        
        res = await llm.ainvoke([sys_msg] + hist_msgs + [user_msg])
        state["final_response_en"] = res.content
    except Exception as e:
        logger.error(f"Response LLM failed: {e}")
        state["final_response_en"] = state.get("context", "An error occurred generating a response.")
    return state


# Router logic
def route_after_moderate(state: AgentState) -> str:
    if not state["is_safe"]:
        return "end"
    return "intent"


if LANGGRAPH_AVAILABLE and StateGraph is not None:
    graph_builder = StateGraph(AgentState)
    graph_builder.add_node("moderate", node_moderate)
    graph_builder.add_node("intent", node_intent)
    graph_builder.add_node("context", node_context)
    graph_builder.add_node("response", node_response)

    graph_builder.add_edge(START, "moderate")
    graph_builder.add_conditional_edges("moderate", route_after_moderate, {"end": END, "intent": "intent"})
    graph_builder.add_edge("intent", "context")
    graph_builder.add_edge("context", "response")
    graph_builder.add_edge("response", END)

    chatbot_graph = graph_builder.compile()
else:
    chatbot_graph = None


async def process_message(
    user_message: str,
    session_id: str,
    conversation_history: list = None,
    force_language: Optional[str] = None,
) -> ChatResponse:
    """Entry point for the LangGraph pipeline"""
    start_time = time.time()
    
    detected_lang = force_language or detect_language(user_message)

    initial_state = {
        "original_message": user_message,
        "translated_message": "",
        "history": conversation_history or [],
        "language": detected_lang,
        "intent": "general",
        "confidence": 0.0,
        "entities": {},
        "context": "",
        "final_response_en": "",
        "pii_found": [],
        "is_safe": True,
        "moderation_reason": ""
    }

    try:
        if chatbot_graph is not None:
            final_state = await chatbot_graph.ainvoke(initial_state)
        else:
            final_state = initial_state
            final_state["intent"] = "general"
            final_state["confidence"] = 0.4
            final_state["entities"] = {}
            final_state["final_response_en"] = (
                "I can help you find workers, check salary ranges, or guide you through booking. "
                "The AI stack is currently in fallback mode, so I am using the built-in worker matching flow."
            )
    except Exception as e:
        logger.error(f"LangGraph failed: {e}")
        final_state = initial_state
        final_state["final_response_en"] = "I'm having trouble processing your request right now."

    # Translate back to user language
    if final_state["is_safe"]:
        final_response_local = translate_from_english(final_state["final_response_en"], target_lang=detected_lang)
    else:
        final_response_local = final_state["final_response_en"]

    elapsed = int((time.time() - start_time) * 1000)

    from app.config import get_settings
    llm_used = bool(get_settings().groq_api_key)

    return ChatResponse(
        response=final_response_local,
        intent=final_state["intent"],
        confidence=final_state["confidence"],
        language=detected_lang,
        response_time_ms=elapsed,
        pii_found=final_state.get("pii_found", []),
        entities=final_state.get("entities", {}),
        llm_used=llm_used,
    )
