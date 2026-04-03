#!/bin/bash
# ─────────────────────────────────────────────────────────────────────
# deploy.sh — Apply all K8s manifests in order
# Usage:  ./scripts/deploy.sh [staging|production]
# ─────────────────────────────────────────────────────────────────────
set -euo pipefail

NAMESPACE="taskflow"
ENV="${1:-staging}"

echo "🚀 Deploying TaskFlow to: $ENV"
echo "   Namespace: $NAMESPACE"
echo ""

# Apply manifests in order (numbered files ensure correct sequence)
for manifest in k8s/*.yaml; do
    echo "  Applying: $manifest"
    kubectl apply -f "$manifest" -n "$NAMESPACE"
done

echo ""
echo "⏳ Waiting for rollouts..."
kubectl rollout status deployment/taskflow-backend  -n "$NAMESPACE" --timeout=120s
kubectl rollout status deployment/taskflow-frontend -n "$NAMESPACE" --timeout=120s

echo ""
echo "✅ Deploy complete! Pod status:"
kubectl get pods -n "$NAMESPACE"
