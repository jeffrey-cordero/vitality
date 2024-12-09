import { produce } from "immer";
import { Dispatch } from "react";
import { VitalityResponse } from "@/lib/global/response";

export interface VitalityInputState {
  value: any;
  error: string | null;
  data: Record<string, any>;
  handlesOnChange?: boolean;
}

export type VitalityState = Record<string, VitalityInputState>;
export type VitalityUpdateState = { id: string; input: VitalityInputState };

export interface VitalityProps {
  globalState: VitalityState;
  globalDispatch: Dispatch<VitalityAction<any>>;
}

export interface VitalityChildProps extends VitalityProps {
  localState: VitalityState;
  localDispatch: Dispatch<VitalityAction<any>>;
}

export type VitalityResetState = Record<string, {
   value: any;
   data: { [key: string]: any };
}>

export interface VitalityAction<T> {
  type:
    | "initializeState"
    | "updateState"
    | "updateStates"
    | "updateErrors"
    | "resetState";
  value:
    | VitalityState
    | VitalityUpdateState
    | VitalityResponse<T>
    | VitalityState
    | VitalityResetState;
}

export function formReducer(
   state: VitalityState,
   action: VitalityAction<any>
): VitalityState {
   return produce(state, (draft) => {
      switch (action.type) {
         case "initializeState":
            const inputs = action.value as VitalityState;

            for (const key of Object.keys(inputs)) {
               draft[key] = inputs[key];
            }

            break;
         case "updateState":
            const { id, input } = action.value as VitalityUpdateState;
            draft[id] = input;

            break;
         case "updateStates":
            const updates = action.value as VitalityState;

            for (const key in state) {
               draft[key] = updates[key] ?? state[key];
            }

            break;
         case "updateErrors":
            const response = action.value as VitalityResponse<any>;

            for (const key in state) {
               draft[key].error = response.body.errors[key]?.[0] ?? null;
            }

            break;
         case "resetState":
            const reset = action.value as VitalityResetState;

            for (const key in state) {
               draft[key] = {
                  ...state[key],
                  value: reset[key]?.value ?? "",
                  error: null,
                  data: reset[key]?.data ?? state[key].data
               };
            }

            break;
      }
   });
}