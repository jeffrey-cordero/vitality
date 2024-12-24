import { produce } from "immer";
import { Dispatch } from "react";

import { VitalityResponse } from "@/lib/global/response";

export interface VitalityInputState {
  id: string;
  value: any;
  error: string | null;
  data?: Record<string, any>;
  handlesChanges?: boolean;
}

export interface VitalityProps {
   globalState: VitalityState;
   globalDispatch: Dispatch<VitalityAction<any>>;
}

export interface VitalityChildProps extends VitalityProps {
   localState: VitalityState;
   localDispatch: Dispatch<VitalityAction<any>>;
}

export type VitalityState = Record<string, VitalityInputState>;
export type VitalityUpdateState = { id: string; value: Partial<VitalityInputState>};
export type VitalityUpdateStates = Partial<Record<string, Partial<VitalityInputState>>>;

export interface VitalityAction<T> {
  type:
    | "updateState"
    | "resetState"
    | "updateStates"
    | "processResponse"
  value:
    | VitalityUpdateState
    | VitalityUpdateStates
    | VitalityResponse<T>
}

export function formReducer(state: VitalityState, action: VitalityAction<any>): VitalityState {
   return produce(state, (draft) => {
      const updateDraft = (update: VitalityUpdateState) => {
         const { id, value } = update;

         console.log(id, value);

         // Merge provided state object with existing state object
         draft[id] = {
            ...state[id],
            ...value
         };

         // If data object currently exists, merge it with provided state data object
         state[id].data && (draft[id].data = {
            ...state[id].data,
            ...value.data
         });
      };

      switch (action.type) {
         case "updateState":
            // Update the state object with the provided update
            updateDraft(action.value as VitalityUpdateState);

            break;
         case "updateStates":
            const updates = action.value as VitalityUpdateStates;

            for (const key in updates) {
               // Update each state object with the provided updates
               updateDraft({
                  id: key,
                  value: updates[key]
               });
            }

            break;
         case "processResponse":
            const response = action.value as VitalityResponse<any>;

            for (const key in state) {
               // Add applicable error messages or nullify existing errors
               updateDraft({
                  id: key,
                  value: {
                     error: response.body.errors[key]?.[0] ?? null
                  }
               });
            }

            break;
         case "resetState":
            const reset = action.value as VitalityUpdateStates;

            for (const key in state) {
               // Reset the state object to its initial value or the provided reset value
               updateDraft({
                  id: key,
                  value: reset[key] ?? state[key]
               });
            }

            break;
      }
   });
}