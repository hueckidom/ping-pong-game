variable "service_account_token" {
  description = "A service account token"
  sensitive = true
}
variable "project_id" {
  description = "The project ID to host the cluster in"
  default     = "52fc6c87-1e26-43aa-b539-eb0aec25d998"
}
variable "cluster_name" {
  description = "The name for the GKE cluster"
  default     = "cl-b62pqoin"
}
variable "object_storage_access_key" {
  description = "An access key to object storage"
  sensitive = true
}
variable "object_storage_secret_key" {
  description = "A secret key to object storage"
  sensitive = true
}
variable "s3_bucket_name" {
  description = "The name of S3 bucket"
  default     = "ping-pong-game"
}
variable "ping_pong_game_github_repo_url" {
  description = "Github repository URL of an application"
  default = "https://github.com/hueckidom/ping-pong-game"
}

variable "image_tag" {
  description = "Image tag of service and client"
}