# ArgoCD Applications for IoT Sphere

This directory contains ArgoCD application configurations for deploying the IoT Sphere application components.

## Dashboard Applications

### 1. dashboard.yaml (Helm-based)
This application uses the Helm chart located at `helm/charts/iot-sphere` to deploy the dashboard frontend.

**Features:**
- Uses Helm values for configuration
- Includes ingress configuration with TLS
- Automated sync with self-healing
- Resource limits and health checks

**Configuration:**
- Repository: `https://github.com/burakcitaci/iot-sphere.git`
- Branch: `feature/helm-chart`
- Update `image.repository` to use your container registry
- Update `host` in ingress configuration to your domain
- Adjust resource limits as needed

### 2. dashboard-kustomize.yaml (Kustomize-based)
This application uses Kustomize to deploy the dashboard frontend directly from the application source.

**Features:**
- Direct deployment from application source
- Image tag management
- Automated sync with self-healing

## Usage

### Apply the ArgoCD Application

```bash
# For Helm-based deployment
kubectl apply -f argocd/apps/dashboard.yaml

# For Kustomize-based deployment
kubectl apply -f argocd/apps/dashboard-kustomize.yaml
```

### Check Application Status

```bash
# Check ArgoCD application status
kubectl get applications -n argocd

# Get detailed status
kubectl describe application dashboard -n argocd
```

### Access ArgoCD UI

```bash
# Port forward ArgoCD server
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Access at https://localhost:8080
# Default credentials: admin / <initial-password>
```

## Prerequisites

1. **ArgoCD installed** in your cluster
2. **Git repository** with your application code (using `feature/helm-chart` branch)
3. **Container registry** with your dashboard image
4. **Ingress controller** (nginx-ingress) if using ingress
5. **cert-manager** if using TLS certificates

## Customization

### Update Image Repository
Replace `your-registry/iot-sphere-dashboard` with your actual container registry and image name.

### Update Domain
Replace `dashboard.your-domain.com` with your actual domain name.

### Resource Limits
Adjust CPU and memory limits based on your application requirements:

```yaml
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi
```

## Troubleshooting

### Application Sync Issues
```bash
# Check application events
kubectl get events -n argocd --sort-by='.lastTimestamp'

# Check application logs
kubectl logs -n argocd deployment/argocd-application-controller
```

### Image Pull Issues
Ensure your cluster has access to your container registry and the image exists.

### Ingress Issues
Verify that your ingress controller is properly configured and the domain resolves to your cluster. 