"""
Action Handlers — structured responses for each intent.
These are called when intent classifier is confident (>0.5).
"""
import random
from app.services.matching_engine import search_workers, get_stats
from app.services.salary_predictor import predict_salary


def handle_greeting(entities: dict, lang: str = "en") -> str:
    greetings = [
        "🙏 Namaste! I'm Sahayak, your AI assistant for finding skilled blue-collar workers across India. How can I help you today?",
        "👋 Hello! Welcome to Sahayak. I can help you find verified workers, check salaries, or post a job. What do you need?",
        "🌟 Hi there! I'm Sahayak — connecting you with skilled workers instantly. Tell me what you're looking for!",
    ]
    return random.choice(greetings)


def handle_farewell(entities: dict, lang: str = "en") -> str:
    return "👋 Thank you for using Sahayak! Come back whenever you need skilled workers. Have a great day! 🙏"


def handle_help(entities: dict, lang: str = "en") -> str:
    return """🤖 **Sahayak — What I Can Do:**

🔍 **Find Workers** — "Find an electrician in Mumbai"
💰 **Check Salary** — "What does a plumber charge in Delhi?"
📋 **Register** — "How do I register as a worker?"
✅ **Verify Worker** — "How to verify a worker's credentials?"
📊 **Job Status** — "Check status of booking #123"
💳 **Payment Help** — "How do UPI payments work?"
🆘 **Emergency** — "Need urgent help with electrical issue!"

Just type naturally in Hindi or English — I understand both! 🇮🇳"""


def handle_find_worker(entities: dict, lang: str = "en") -> str:
    query_parts = []
    if "designation" in entities:
        query_parts.append(entities["designation"])
    if "city" in entities:
        query_parts.append(entities["city"])
    if "state" in entities:
        query_parts.append(entities["state"])

    query = " ".join(query_parts) if query_parts else "skilled worker"
    workers = search_workers(
        query=query,
        city=entities.get("city"),
        designation=entities.get("designation"),
        top_k=3,
    )

    if not workers:
        return "😔 No workers found matching your criteria. Try broadening your search or different location."

    designation = entities.get("designation", "Workers")
    city = entities.get("city", "your area")

    response = f"🔍 **Top {designation} in {city}:**\n\n"
    for i, w in enumerate(workers[:3], 1):
        rating_stars = "⭐" * int(float(w.get("rating", 0)))
        availability = w.get("availability", "Unknown")
        avail_icon = "🟢" if "Available" in availability else "🔴"
        response += (
            f"**{i}. {w.get('full_name', 'N/A')}**\n"
            f"   💼 {w.get('designation', '')} | {avail_icon} {availability}\n"
            f"   {rating_stars} {w.get('rating', 0)} ({w.get('reviews_count', 0)} reviews)\n"
            f"   💰 ₹{w.get('hourly_rate_inr', 0)}/hr | 📍 {w.get('city', '')}, {w.get('state', '')}\n"
            f"   🌐 {w.get('experience_years', 0)} yrs exp\n\n"
        )

    response += "💬 Type the worker's name to get full contact details, or refine your search!"
    return response


def handle_check_salary(entities: dict, lang: str = "en") -> str:
    designation = entities.get("designation", "Electrician")
    city = entities.get("city", "Delhi")
    experience = 5  # default

    result = predict_salary(
        designation=designation,
        city=city,
        experience_years=experience,
    )

    return (
        f"💰 **Salary Estimate: {designation} in {city}**\n\n"
        f"📊 Based on our data of 500+ verified workers:\n"
        f"   • Minimum: ₹{result.get('predicted_min', 'N/A')}/hour\n"
        f"   • Average: ₹{result.get('predicted_median', 'N/A')}/hour\n"
        f"   • Top earners: ₹{result.get('predicted_max', 'N/A')}/hour\n\n"
        f"💡 *Rates vary by experience, location, and skill level.*\n"
        f"🤖 Powered by {'ML model' if result.get('confidence') == 'ml_model' else 'rule-based estimate'}"
    )


def handle_register_worker(entities: dict, lang: str = "en") -> str:
    return """📋 **Register as a Worker on Sahayak:**

**Step 1:** Visit the Workers page → Click "Add Worker"
**Step 2:** Fill in your details:
   • Full Name, Designation, Skills
   • City, State, Languages known
   • Hourly rate expectation
   • Payment preferences (UPI/Cash/Bank)

**Step 3:** Upload verification documents (optional)
   • Skill certificate
   • Government ID (auto-verified with AI)

**Step 4:** Profile goes live instantly! ✅

📱 **Quick Register via WhatsApp:**
Send "REGISTER" to our WhatsApp number.

💡 **Tip:** Workers with 4.5+ ratings get 3x more bookings!"""


def handle_emergency(entities: dict, lang: str = "en") -> str:
    return """🆘 **EMERGENCY MODE ACTIVATED**

For immediate assistance:
📞 **Emergency Helpline:** 1800-XXX-XXXX (Free)
⚡ **Electrician:** Available 24/7 in most cities
💧 **Plumber:** Emergency response <2 hours

**Nearest Emergency Workers:**
🔴 Searching your area for available workers...

⚠️ **Safety First:**
• Turn off main power switch for electrical emergencies
• Close water main valve for plumbing emergencies
• Call 112 if there is immediate danger to life

*A Sahayak agent will contact you within 5 minutes.*"""


def handle_payment_issue(entities: dict, lang: str = "en") -> str:
    return """💳 **Payment Help — Sahayak**

**Supported Payment Methods:**
• 💳 UPI (PhonePe, GPay, Paytm)
• 🏦 Bank Transfer (NEFT/IMPS)
• 💵 Cash on completion

**Common Issues:**
❓ *Payment failed?* → Retry after 5 min; money returns in 2-3 days
❓ *Worker demanding extra?* → Report via Disputes page
❓ *Need refund?* → Submit dispute within 48 hours

**Our Guarantee:**
✅ Sahayak SafePay protects every transaction
✅ Escrow holds payment until job is confirmed complete
✅ 100% refund if worker doesn't show up

💬 Type "raise dispute" to file a complaint"""


def handle_dispute(entities: dict, lang: str = "en") -> str:
    return """⚖️ **File a Dispute**

**Grounds for Dispute:**
• Worker didn't show up
• Work quality was poor
• Payment discrepancy
• Fraudulent behavior

**How to File:**
1. Go to **Disputes** page in your dashboard
2. Click **"New Dispute"**
3. Select booking reference
4. Describe the issue with photos (optional)
5. Submit — expect response in 24 hours

**Our SLA:**
⏱️ Resolution time: 24-48 hours
💰 Refund processing: 3-5 business days

🤝 Sahayak takes all disputes seriously — we protect both workers and employers!"""


def handle_verify_worker(entities: dict, lang: str = "en") -> str:
    return """✅ **Worker Verification System**

**Verification Levels:**
🟢 **Verified** — ID + skill certificate confirmed
🟡 **Pending** — Documents under review (24hr)
🔴 **Unverified** — No documents uploaded

**How We Verify:**
1. 🤖 AI reads uploaded documents (Gemini Vision)
2. 🔍 Cross-checks name and skills
3. ✅ Auto-approves genuine certificates
4. 🚨 Flags suspicious documents for manual review

**Worker can upload:**
• Aadhar Card (number auto-redacted for privacy)
• Skill certificate (ITI/NSDC)
• Previous employer reference

💡 Verified workers earn 40% more!
Go to **Workers → Verification Queue** to review."""


def handle_general(entities: dict, lang: str = "en", user_message: str = "") -> str:
    return (
        "🤔 I'm not quite sure what you need. Here's what I can help with:\n\n"
        "• 🔍 Find workers by skill and location\n"
        "• 💰 Check salary/wage estimates\n"
        "• 📋 Worker registration\n"
        "• ⚖️ Raise disputes\n"
        "• 🆘 Emergency worker requests\n\n"
        "Try: *'Find electrician in Mumbai'* or *'What does a plumber charge?'*"
    )


HANDLER_MAP = {
    "greeting": handle_greeting,
    "farewell": handle_farewell,
    "help": handle_help,
    "find_worker": handle_find_worker,
    "check_salary": handle_check_salary,
    "register_worker": handle_register_worker,
    "emergency": handle_emergency,
    "payment_issue": handle_payment_issue,
    "dispute": handle_dispute,
    "verify_worker": handle_verify_worker,
    "check_availability": handle_find_worker,
    "job_status": handle_general,
    "skill_info": handle_general,
    "location_search": handle_find_worker,
    "language_help": handle_help,
    "general": handle_general,
}


def get_handler(intent: str):
    return HANDLER_MAP.get(intent, handle_general)
