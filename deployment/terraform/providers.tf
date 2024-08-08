terraform {
  required_version = ">= 1.9.1"
  required_providers {
    stackit = {
      source  = "stackitcloud/stackit"
      version = "0.26.2"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "2.14.0"
    }
    kubectl = {
      source  = "gavinbunney/kubectl"
      version = ">= 1.14.0"
    }
  }
}