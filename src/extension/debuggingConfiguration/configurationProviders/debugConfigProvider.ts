// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.

import { BaseConfigProvider } from "./baseConfigProvider";
import { MultiStepInput, InputStep } from "../multiStepInput";
import {
    DebugConfigurationState,
    platformTypeDebugPickConfig,
    DEBUG_TYPES,
    DebugScenarioType,
} from "../debugConfigTypesAndConstants";
import { PlatformType } from "../../launchArgs";
import { ILaunchRequestArgs } from "../../../debugger/debugSessionBase";

export class DebugConfigProvider extends BaseConfigProvider {
    constructor() {
        super();
        this.maxStepCount = 2;
    }

    public async buildConfiguration(
        input: MultiStepInput<DebugConfigurationState>,
        state: DebugConfigurationState,
    ): Promise<InputStep<DebugConfigurationState> | void> {
        state.config = {};
        const config: Partial<ILaunchRequestArgs> = {
            name: "Debug application",
            request: "launch",
            type: DEBUG_TYPES.REACT_NATIVE,
            cwd: "${workspaceFolder}",
        };

        state.scenarioType = DebugScenarioType.DebugApp;

        await this.configurationProviderHelper.selectPlatform(
            input,
            config,
            platformTypeDebugPickConfig,
            1,
            this.maxStepCount,
        );

        Object.assign(state.config, config);

        if (
            state.config.platform === PlatformType.iOS ||
            state.config.platform === PlatformType.Android
        ) {
            return () => this.configureApplicationType(input, state.config);
        } else if (state.config.platform === PlatformType.Exponent) {
            return () => this.configureExpoHostType(input, state.config);
        } else {
            return;
        }
    }

    private async configureApplicationType(
        input: MultiStepInput<DebugConfigurationState>,
        config: Partial<ILaunchRequestArgs>,
    ): Promise<InputStep<DebugConfigurationState> | void> {
        await this.configurationProviderHelper.selectApplicationType(
            input,
            config,
            2,
            this.maxStepCount,
        );

        if (
            config.platform === PlatformType.iOS &&
            config.type === DEBUG_TYPES.REACT_NATIVE_DIRECT
        ) {
            delete config.useHermesEngine;
            this.maxStepCount = this.maxStepCount + 1;
            await this.configurationProviderHelper.shouldUseHermesEngine(
                input,
                config,
                3,
                this.maxStepCount,
            );
            if (config.useHermesEngine) {
                delete config.useHermesEngine;
            }
        }
    }

    private async configureExpoHostType(
        input: MultiStepInput<DebugConfigurationState>,
        config: Partial<ILaunchRequestArgs>,
    ): Promise<InputStep<DebugConfigurationState> | void> {
        await this.configurationProviderHelper.selectExpoHostType(
            input,
            config,
            2,
            this.maxStepCount,
        );
    }
}