variable "cloudflare_account_id" {
  description = "Cloudflare account that owns the Worker, D1 database, and R2 bucket."
  type        = string
}

variable "backend_worker_name" {
  description = "Worker script name managed by Terraform."
  type        = string
}

variable "character_data_r2_bucket_name" {
  description = "R2 bucket for application-managed character snapshots."
  type        = string
}
