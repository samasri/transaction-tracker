"use client";

import { RefObject, useRef, useState } from "react";
import { savePlaidConfig, savePushbulletConfig, saveSplitwiseConfig } from "./server";
import assert from "assert";

export const dynamic = "force-dynamic";

type GenericConfigValueMap = { [index: string]: string | undefined };

type ConfigValueMap<Config> = {
  [index in keyof Config]: string;
};

interface IntegrationProps<Config extends GenericConfigValueMap> {
  name: string;
  config: Config;
  saveFunction: (arg: ConfigValueMap<Config>) => void;
}

interface ConfigUIAttachments {
  [index: string]: {
    ref: RefObject<HTMLInputElement>;
    isHidden: boolean;
    setIsHidden: (arg: boolean) => void;
  };
}

const Integration = <Config extends GenericConfigValueMap>(props: IntegrationProps<Config>) => {
  const attachments = Object.keys(props.config).reduce((refsMap, config) => {
    const [isHidden, setIsHidden] = useState(true);
    return {
      ...refsMap,
      [config]: {
        ref: useRef<HTMLInputElement>(null),
        isHidden,
        setIsHidden,
      },
    };
  }, {} as ConfigUIAttachments);
  return (
    <>
      <h3>{props.name}</h3>
      <ul>
        {Object.keys(props.config).map((configName) => (
          <li>
            <label>{configName}: </label>
            <input
              ref={attachments[configName].ref}
              type={attachments[configName].isHidden ? "password" : "text"}
              defaultValue={props.config[configName] ?? ""}
            ></input>
            <button onClick={() => attachments[configName].setIsHidden(!attachments[configName].isHidden)}>👀</button>
          </li>
        ))}
      </ul>
      <button
        onClick={() => {
          const configValues = Object.keys(props.config).reduce(
            (valueMap, configName) => ({
              ...valueMap,
              [configName]: attachments[configName].ref.current?.value ?? "",
            }),
            {} as ConfigValueMap<Config>
          );
          props.saveFunction(configValues);
        }}
      >
        Save
      </button>
    </>
  );
};

interface ConfigProps {
  plaid: {
    clientId?: string;
    secret?: string;
  };
  splitwise: {
    apiKey?: string;
    groupId?: string;
  };
  pushbullet: {
    apiToken?: string;
    targetDevice?: string;
  };
}

export const Config = ({ plaid, splitwise, pushbullet }: ConfigProps) => {
  return (
    <>
      <Integration
        name="Plaid"
        config={{
          "Client Id": plaid.clientId,
          Secret: plaid.secret,
        }}
        saveFunction={(credentials) =>
          savePlaidConfig({ clientId: credentials["Client Id"], secret: credentials.Secret })
        }
      />
      <Integration
        name="Splitwise"
        config={{
          "API Key": splitwise.apiKey,
          "Group ID": splitwise.groupId,
        }}
        saveFunction={(credentials) =>
          saveSplitwiseConfig({ apiKey: credentials["API Key"], groupId: credentials["Group ID"] })
        }
      />
      <Integration
        name="Pushbullet"
        config={{
          "API Token": pushbullet.apiToken,
          "Target Device": pushbullet.targetDevice,
        }}
        saveFunction={(credentials) =>
          savePushbulletConfig({ apiToken: credentials["API Token"], targetDevice: credentials["Target Device"] })
        }
      />
    </>
  );
};
