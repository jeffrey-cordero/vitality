import { produce } from "immer";

export interface VitalityInputState {
  id: string;
  value: any;
  defaultValue: any;
  error: any | null;
  type: string | null;
  data: { [key: string]: any };
}

export type VitalityInputStates = { [key: string]: VitalityInputState };
export interface VitalityResponse {
  status: "Success" | "Error" | "Failure";
  body: {
    message: string;
    data: any | null;
    errors: { [key: string]: string[] | undefined };
  };
}

export interface VitalityResetState {
  [key: string]: any;
}

export interface VitalityAction {
  type: "initializeState"| "updateInput" | "updateStatus" | "updateState" | "resetState";
  value:
    | VitalityInputStates
    | VitalityInputState
    | VitalityResponse
    | VitalityState
    | VitalityResetState;
}

export interface VitalityState {
  status: "Initial" | "Success" | "Error" | "Failure";
  inputs: VitalityInputStates;
  response: VitalityResponse | null;
}

export function formReducer(state: VitalityState, action: VitalityAction): VitalityState {
   return produce(state, (draft) => {
      switch (action.type) {
      case "initializeState":
         const VitalityInputStates = action.value as VitalityInputStates;

         for (const key of Object.keys(VitalityInputStates)) {
            draft.inputs[key] = VitalityInputStates[key];
         }

         break;
      case "updateInput":
         const input = action.value as VitalityInputState;
         draft.inputs[input.id] = input;

         break;
      case "updateStatus":
         const response = action.value as VitalityResponse;

         if (response) {
            draft.status = response.status;
            draft.response = response;

            for (const key in state.inputs) {
               draft.inputs[key].error = response?.body.errors[key] ?? null;
            }
         }

         break;
      case "updateState":
         // Manually update properties of draft (complex state)
         Object.assign(draft, action.value as VitalityState);
         break;
      case "resetState":
         const reset = action.value as VitalityResetState;

         for (const key in state.inputs) {
            draft.inputs[key] = {
               ...state.inputs[key],
               value: state.inputs[key].defaultValue,
               error: null,
               data: reset[key] ?? state.inputs[key].data
            };
         }

         break;
      default:
         return state;
      }
   });
}

export function sendSuccessMessage(message: string, data?: any): VitalityResponse {
   return {
      status: "Success",
      body: { message: message, data: data, errors: {} }
   };
}

export function sendErrorMessage(
   status: "Error" | "Failure",
   message: string,
   errors: { [key: string]: string[] }
): VitalityResponse {
   return {
      status: status,
      body: {
         message: message,
         data: null,
         errors: errors ?? {}
      }
   };
}
