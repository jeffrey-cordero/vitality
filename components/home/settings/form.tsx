import { formReducer, VitalityState } from "@/lib/global/state";
import { useReducer } from "react";

const form: VitalityState = {
   username: {
      value: "",
      error: null,
      data: {}
   },
   password: {
      value: "",
      error: null,
      data: {}
   },
   confirmPassword: {
      value: "",
      error: null,
      data: {}
   },
   name: {
      value: "",
      error: null,
      data: {}
   },
   birthday: {
      value: "",
      error: null,
      data: {}
   },
   email: {
      value: "",
      error: null,
      data: {}
   },
   phone: {
      value: "",
      error: null,
      data: {}
   }
};

export default function Form(): JSX.Element {
   const [state, dispatch] = useReducer(formReducer, form);

   console.log(state);
   return (
      <h1> FORM </h1>
   )
}