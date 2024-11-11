import { NotificationProps } from "@/components/global/notification";
import { produce } from "immer";
import { Dispatch } from "react";

export interface VitalityInputState {
  value: any;
  error: string | null;
  data: { [key: string]: any };
  handlesOnChange?: boolean;
}

export type VitalityState = { [key: string]: VitalityInputState };
export type VitalityUpdateState = { id: string; input: VitalityInputState };

export interface VitalityProps {
  globalState: VitalityState;
  globalDispatch: Dispatch<VitalityAction<any>>;
}

export interface VitalityChildProps extends VitalityProps {
  localState: VitalityState;
  localDispatch: Dispatch<VitalityAction<any>>;
}

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
   action: VitalityAction<any>,
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
         default:
            return state;
      }
   });
}

export function sendSuccessMessage<T>(
   message: string,
   data: T,
): VitalityResponse<T> {
   return {
      status: "Success",
      body: {
         data: data,
         message: message,
         errors: {}
      }
   };
}

export function sendErrorMessage<T>(
   status: "Error" | "Failure",
   message: string,
   data: T,
   errors: { [key: string]: string[] },
): VitalityResponse<T> {
   return {
      status: status,
      body: {
         data: data,
         message: message,
         errors: errors ?? {}
      }
   };
}

export function handleResponse(
   dispatch: Dispatch<VitalityAction<any>>,
   response: VitalityResponse<any>,
   successMethod: () => void,
   updateNotification: (_notification: NotificationProps) => void,
): void {
   if (response.status === "Success") {
      // Remove any existing notifications
      updateNotification({
         status: "Initial",
         message: ""
      });

      // Call the success method appropriately
      successMethod.call(null);
   } else if (
      response.status === "Error" &&
    Object.keys(response.body.errors).length > 0
   ) {
      // Update state to display all errors relative to the response
      dispatch({
         type: "updateErrors",
         value: response
      });

      document
         .getElementsByClassName("input-error")
         .item(0)
         ?.scrollIntoView({ behavior: "smooth", block: "center" });
   } else {
      // Display failure notification to the user
      updateNotification({
         status: response.status,
         message: response.body.message,
         timer: undefined
      });
   }
}
