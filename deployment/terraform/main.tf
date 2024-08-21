provider "stackit" {
  region = "eu01"
  service_account_token = var.service_account_token
}

terraform {
  backend "s3" {
    bucket = "ping-pong-game"
    key    = "ping-pong-game/tfstate"
    endpoints = {
      s3 = "https://object.storage.eu01.onstackit.cloud"
    }
    region                      = "eu01"
    skip_credentials_validation = true
    skip_region_validation      = true
    skip_s3_checksum            = true
    skip_requesting_account_id  = true
    secret_key                  = "${var.object_storage_secret_key}"
    access_key                  = "${var.object_storage_access_key}"
  }
}

resource "stackit_ske_kubeconfig" "kubeconfig" {
  project_id   = var.project_id
  cluster_name = stackit_ske_cluster.ske.name
  refresh      = true
}


provider "helm" {
  kubernetes {
    config_path = null
    config_context = null
    host = yamldecode(stackit_ske_kubeconfig.kubeconfig.kube_config).clusters[0].cluster.server

    client_certificate     = base64decode(yamldecode(stackit_ske_kubeconfig.kubeconfig.kube_config).users[0].user["client-certificate-data"])
    client_key             = base64decode(yamldecode(stackit_ske_kubeconfig.kubeconfig.kube_config).users[0].user["client-key-data"])
    cluster_ca_certificate = base64decode(yamldecode(stackit_ske_kubeconfig.kubeconfig.kube_config).clusters[0].cluster["certificate-authority-data"])
  }
}

provider "kubectl" {
  host = yamldecode(stackit_ske_kubeconfig.kubeconfig.kube_config).clusters[0].cluster.server

  client_certificate     = base64decode(yamldecode(stackit_ske_kubeconfig.kubeconfig.kube_config).users[0].user["client-certificate-data"])
  client_key             = base64decode(yamldecode(stackit_ske_kubeconfig.kubeconfig.kube_config).users[0].user["client-key-data"])
  cluster_ca_certificate = base64decode(yamldecode(stackit_ske_kubeconfig.kubeconfig.kube_config).clusters[0].cluster["certificate-authority-data"])
  load_config_file       = false
}

provider "kubernetes" {
  config_path = null
  host = yamldecode(stackit_ske_kubeconfig.kubeconfig.kube_config).clusters[0].cluster.server

  client_certificate     = base64decode(yamldecode(stackit_ske_kubeconfig.kubeconfig.kube_config).users[0].user["client-certificate-data"])
  client_key             = base64decode(yamldecode(stackit_ske_kubeconfig.kubeconfig.kube_config).users[0].user["client-key-data"])
  cluster_ca_certificate = base64decode(yamldecode(stackit_ske_kubeconfig.kubeconfig.kube_config).clusters[0].cluster["certificate-authority-data"])
}

resource "helm_release" "argocd" {
  name = "argocd"
  repository = "https://argoproj.github.io/argo-helm"
  chart = "argo-cd"
  namespace = "argocd"
  create_namespace = true
  timeout = 600
  skip_crds = true
}

resource "helm_release" "ingress-nginx" {
  name = "ingress-nginx"
  repository = "https://kubernetes.github.io/ingress-nginx"
  chart = "ingress-nginx"
  namespace = "ingress-nginx"
  create_namespace = true
  timeout = 300
  skip_crds = true
}

resource "kubectl_manifest" "argocd-ping-pong-service" {
  depends_on = [helm_release.argocd, stackit_ske_cluster.ske]
  yaml_body = templatefile("${path.module}/argocd_templates/argocd-ping-pong-service.yaml", {
    github_repo_url = var.ping_pong_game_github_repo_url
    helm_chart_path = "deployment/helm/service"
    resource_name = "ping-pong-service"
    image_tag = var.image_tag
  })
}

resource "kubectl_manifest" "argocd-ping-pong-client" {
  depends_on = [helm_release.argocd, stackit_ske_cluster.ske, kubectl_manifest.argocd-ping-pong-service]
  yaml_body = templatefile("${path.module}/argocd_templates/argocd-ping-pong-client.yaml", {
    github_repo_url = var.ping_pong_game_github_repo_url
    helm_chart_path = "deployment/helm/client"
    resource_name = "ping-pong-client"
    image_tag = var.image_tag
  })
}