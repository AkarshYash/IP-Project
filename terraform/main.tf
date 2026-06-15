terraform {
  required_providers {
    # In a real scenario, you'd use specific providers like AWS, Render, or Railway
    # We use a mock configuration here representing the infrastructure as code.
    null = {
      source = "hashicorp/null"
      version = "~> 3.0"
    }
  }
}

provider "null" {}

# ── Variables ─────────────────────────────────────────────────────────────
variable "project_name" {
  type    = string
  default = "sahayak-bluecollar-ai"
}

variable "environment" {
  type    = string
  default = "production"
}

# ── Database (Supabase / Postgres) ────────────────────────────────────────
# In a real setup, you'd use a provider like supabase/supabase to provision.
resource "null_resource" "supabase_db" {
  triggers = {
    project = var.project_name
  }

  provisioner "local-exec" {
    command = "echo 'Provisioning Supabase PostgreSQL instance for ${var.project_name}...'"
  }
}

# ── App Hosting (Render / Fly.io / Railway) ───────────────────────
resource "null_resource" "app_service" {
  depends_on = [null_resource.supabase_db]

  triggers = {
    project = var.project_name
    env     = var.environment
  }

  provisioner "local-exec" {
    command = "echo 'Deploying Unified App (FastAPI + Static Frontend) to Free Tier cloud container...'"
  }
}

# Outputs
output "backend_url" {
  value = "https://api.${var.project_name}.com"
}

output "frontend_url" {
  value = "https://${var.project_name}.com"
}
