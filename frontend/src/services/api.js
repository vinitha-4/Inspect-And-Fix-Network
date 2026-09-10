/**
 * API Service for interacting with Python FastAPI backend.
 */
const API_BASE_URL = "http://127.0.0.1:8005/api";

export async function analyzeConfiguration(configuration) {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ configuration }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to analyze configuration");
  }

  return response.json();
}

export async function applyFix(configuration, suggestedFix, intf, vlanId) {
  const response = await fetch(`${API_BASE_URL}/apply-fix`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      configuration,
      suggested_fix: suggestedFix,
      interface: intf,
      vlan_id: vlanId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to apply fix");
  }

  return response.json();
}

export async function verifyConfiguration(configuration, issueId) {
  const response = await fetch(`${API_BASE_URL}/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      configuration,
      issue_id: issueId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to run verification");
  }

  return response.json();
}

export async function getSampleConfigs() {
  const response = await fetch(`${API_BASE_URL}/sample-configs`);
  if (!response.ok) {
    throw new Error("Failed to fetch sample configurations");
  }
  return response.json();
}

