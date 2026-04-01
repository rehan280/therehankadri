import "server-only";

export type VercelDeployStatus = {
  enabled: boolean;
  projectName?: string;
};

export type VercelDeployResult = {
  enabled: boolean;
  triggered: boolean;
};

function getVercelDeployHookUrl() {
  return process.env.VERCEL_DEPLOY_HOOK_URL?.trim() || "";
}

export function getVercelDeployStatus(): VercelDeployStatus {
  const deployHookUrl = getVercelDeployHookUrl();

  return {
    enabled: Boolean(deployHookUrl),
    projectName: process.env.VERCEL_PROJECT_NAME?.trim() || undefined,
  };
}

export async function triggerVercelDeploy(): Promise<VercelDeployResult> {
  const deployHookUrl = getVercelDeployHookUrl();

  if (!deployHookUrl) {
    return {
      enabled: false,
      triggered: false,
    };
  }

  const response = await fetch(deployHookUrl, {
    method: "POST",
    cache: "no-store",
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `Vercel deploy hook failed (${response.status}): ${responseText}`
    );
  }

  return {
    enabled: true,
    triggered: true,
  };
}
