#!/bin/bash
# ─────────────────────────────────────────────────────────────────────
# rollback.sh — Roll back to the previous deployment
# Usage:  ./scripts/rollback.sh
# ─────────────────────────────────────────────────────────────────────
set -euo pipefail

NAMESPACE="taskflow"

echo "⏪ Rolling back TaskFlow deployments in namespace: $NAMESPACE"

kubectl rollout undo deployment/taskflow-backend  -n "$NAMESPACE"
kubectl rollout undo deployment/taskflow-frontend -n "$NAMESPACE"

echo "⏳ Waiting for rollback to complete..."
kubectl rollout status deployment/taskflow-backend  -n "$NAMESPACE" --timeout=120s
kubectl rollout status deployment/taskflow-frontend -n "$NAMESPACE" --timeout=120s

echo ""
echo "✅ Rollback complete! Pod status:"
kubectl get pods -n "$NAMESPACE"
