import { produce } from "immer";

export interface VitalityInputState {
  id: string;
  value: any;
  error: string[] | null;
  type: string | null;
  data: { [key: string]: any };
}

export type VitalityInputStates = { [key: string]: VitalityInputState };
export interface VitalityResponse<T> {
  status: "Success" | "Error" | "Failure";
  body: {
    message: string;
    data: T;
    errors: { [key: string]: string[] | undefined };
  };
}

export interface VitalityResetState {
  [key: string]: {
    value: any;
    data: { [key: string]: any };
  };
}

export interface VitalityAction<T> {
  type:
    | "initializeState"
    | "updateInput"
    | "displayErrors"
    | "updateInputs"
    | "resetState";
  value:
    | VitalityInputStates
    | VitalityInputState
    | VitalityResponse<T>
    | VitalityState
    | VitalityResetState;
}

export type VitalityState = { [key: string]: VitalityInputState };

export function formReducer(
   state: VitalityState,
   action: VitalityAction<any>
): VitalityState {
   return produce(state, (draft) => {
      switch (action.type) {
      case "initializeState":
         const inputs = action.value as VitalityInputStates;

         for (const key of Object.keys(inputs)) {
            draft[key] = inputs[key];
         }

         break;
      case "updateInput":
         const input = action.value as VitalityInputState;
         draft[input.id] = input;

         break;
      case "updateInputs":
         // Manually update properties of the draft for complex state manipulation
         Object.assign(draft, action.value as VitalityState);
         break;
      case "displayErrors":
         const response = action.value as VitalityResponse<any>;

         for (const key in state) {
            draft[key].error = response.body.errors[key] ?? null;
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
      default:
         return state;
      }
   });
}

export function sendSuccessMessage<T>(
   message: string,
   data: T
): VitalityResponse<T> {
   return {
      status: "Success",
      body: { message: message, data: data, errors: {} }
   };
}

export function sendErrorMessage<T>(
   status: "Error" | "Failure",
   message: string,
   data: T,
   errors: { [key: string]: string[] }
): VitalityResponse<T> {
   return {
      status: status,
      body: {
         message: message,
         data: data,
         errors: errors ?? {}
      }
   };
}
