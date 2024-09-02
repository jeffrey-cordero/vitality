import { produce } from "immer";

export interface InputState {
  id: string;
  value: any;
  error: any | null;
  type?: string;
  validIcon?: boolean;
  handlesChanges?: boolean;
  options?: Set<any>;
}

export type InputStates = { [key: string]: InputState };
export type FormPayload = { [key: string]: string | Date };
export interface FormResponse {
  status: "Success" | "Error" | "Failure";
  body: { message: string; data: any; errors: { [key: string]: string[] | undefined } };
}

export interface FormAction {
  type:
    | "updateInput"
    | "updateStatus"
    | "updatePayload"
    | "resetForm";
  value: InputState | FormResponse | FormPayload | null;
}

export interface FormState {
  status: "Initial" | "Success" | "Error" | "Failure";
  inputs: InputStates;
  response: FormResponse | null;
}

export const initialFormState: FormState = {
   status: "Initial",
   inputs: {},
   response: null
};

export function constructPayload(state: FormState): FormPayload {
   const payload: FormPayload = {};

   for (const key in state.inputs) {
      payload[key] = state.inputs[key].value;
   }

   return payload;
}

export function formReducer(state: FormState, action: FormAction): FormState {
   return produce(state, (draft) => {
      switch (action.type) {
         case "updateInput":
            const input = action.value as InputState;
            draft.inputs[input.id] = input;

            break;
         case "updateStatus":
            const response = action.value as FormResponse;

            if (response) {
               draft.status = response.status;
               draft.response = response;

               for (const key in state.inputs) {
                  draft.inputs[key].error = response?.body.errors[key] ?? null;
               }
            }

            break;
         case "resetForm":
            for (const key in state.inputs) {
               draft.inputs[key] = {
                  ...state.inputs[key],
                  value: "",
                  error: null
               };
            }

            break;
         default:
            return state;
      }
   });
}

export function sendSuccessMessage(message: string, data?: any): FormResponse {
   return {
      status: "Success",
      body: { message: message, data: data, errors: {} }
   };
}

export function sendErrorMessage(
   status: "Error" | "Failure",
   message: string,
   errors: { [key: string]: string[] }
): FormResponse {
   return {
      status: status,
      body: {
         message: message,
         data: null,
         errors: errors ?? {}
      }
   };
}
