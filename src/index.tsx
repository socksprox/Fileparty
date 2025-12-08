import {
  definePlugin,
  PanelSection,
  PanelSectionRow,
  ToggleField,
  ServerAPI,
  staticClasses,
} from "decky-frontend-lib";
import { VFC, useEffect, useState } from "react";
import { VscDebugDisconnect } from "react-icons/vsc";

type StatusResult = {
  enabled: boolean;
  password?: string | null;
  url?: string | null;
};

const Content: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [password, setPassword] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);

  const refreshStatus = async () => {
    const status = await serverAPI.callPluginMethod<{}, StatusResult>("get_status", {});
    const result = status.result as StatusResult;
    setEnabled(!!result?.enabled);
    setPassword(result?.password ?? null);
    setServerUrl(result?.url ?? null);
  };

  const onToggle = async (value: boolean) => {
    setEnabled(value);
    await serverAPI.callPluginMethod("set_enabled", { enabled: value });
    await refreshStatus();
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  return (
    <PanelSection>
      <PanelSectionRow>
        <ToggleField
          label="Enable Copyparty Server"
          checked={enabled}
          onChange={onToggle}
        />
      </PanelSectionRow>
      <PanelSectionRow>
        <div>
          Enable to start copyparty-sfx serving /home/deck with deck user read/write/delete access.
        </div>
      </PanelSectionRow>
      <PanelSectionRow>
        <div>
          {enabled && password
            ? `Password (user 'deck'): ${password}`
            : "A new 6-character password is generated each time you enable the server."}
        </div>
      </PanelSectionRow>
      <PanelSectionRow>
        <div>
          {enabled && serverUrl
            ? `Reachable at: ${serverUrl}`
            : "Enable the server to see the access URL."}
        </div>
      </PanelSectionRow>
    </PanelSection>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  return {
    title: <div className={staticClasses.Title}>Copyparty File Server</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <VscDebugDisconnect />,
    onDismount() {},
  };
});
