terraform {
  required_version = ">= 1.9.0"

  backend "s3" {}

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.23"
    }
  }
}

provider "cloudflare" {}

resource "cloudflare_d1_database" "character_data" {
  account_id = var.cloudflare_account_id
  name       = "${var.backend_worker_name}-character-data"
}

resource "cloudflare_r2_bucket" "character_data" {
  account_id = var.cloudflare_account_id
  name       = var.character_data_r2_bucket_name
}

resource "cloudflare_workers_script" "backend" {
  account_id     = var.cloudflare_account_id
  script_name    = var.backend_worker_name
  main_module    = "index.js"
  content_file   = "${path.module}/../dist/index.js"
  content_sha256 = filesha256("${path.module}/../dist/index.js")

  bindings = [
    {
      database_id = cloudflare_d1_database.character_data.id
      name        = "DB"
      type        = "d1"
    },
    {
      bucket_name = cloudflare_r2_bucket.character_data.name
      name        = "OBJECTS"
      type        = "r2_bucket"
    },
  ]
}
