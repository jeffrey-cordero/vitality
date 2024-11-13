/** @jest-environment jsdom */
import userEvent from "@testing-library/user-event";
import { useReducer } from "react";
import { act, render, waitFor } from "@testing-library/react";
import { formReducer, VitalityState } from "@/lib/global/state";
import Input from "@/components/global/input";
import Button from "@/components/global/button";


const form: VitalityState = {
   name: {
      value: "",
      error: null,
      data: {}
   },
   email: {
      value: "",
      error: null,
      data: {}
   },
   tags: {
      value: [],
      error: null,
      data: {},
      handlesOnChange: true
   }
};

function HookWrapper(): JSX.Element {
   const [state, dispatch] = useReducer(formReducer, form);

   return (
      <div>
         <Input
            id = "name"
            type = "text"
            label="name"
            input={state.name}
            dispatch={dispatch}
            >
            {state.name.value}
         </Input>
         <Input
            id = "email"
            type = "email"
            label="email"
            input={state.email}
            dispatch={dispatch}
            >
            {state.email.value}
         </Input>
         <div id = "tags">
            {state.tags.value.toString()}
         </div>
         <Button
            id = "initialize"
            onClick = {() => {
               dispatch({
                  type: "initializeState",
                  value: {
                     name: {
                        ...state.name,
                        value: "test"
                     },
                     email: {
                        ...state.email,
                        value: "test@gmail.com"
                     },
                     tags: {
                        ...state.tags,
                        value: ["One", "Two", "Three"]
                     }
                  }
               });
            }}>Initialize State</Button>
      </div>
   );
}

describe("State Management Validation", () => {
   test("Should properly initialize state for all potential inputs", async() => {
      const dom = render(<HookWrapper />);

      // Ensure empty values on initial render
      expect((dom.container.querySelector("#name") as HTMLInputElement).value).toBe("");
      expect((dom.container.querySelector("#email") as HTMLInputElement).value).toBe("");
      expect((dom.container.querySelector("#tags") as HTMLDivElement).textContent).toBe("");

      // Click button to update state
      await act(async() => {
         userEvent.click(dom.container.querySelector("#initialize"));
      });

      // Ensure state initialized properly by waiting for appropriate re-render
      await waitFor(() => {
         expect((dom.container.querySelector("#name") as HTMLInputElement).value).toBe("test");
         expect((dom.container.querySelector("#email") as HTMLInputElement).value).toBe("test@gmail.com");
         expect((dom.container.querySelector("#tags") as HTMLDivElement).textContent).toBe("One,Two,Three");
      });
   });
});