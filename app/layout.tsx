"use client";
import "@/app/global.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import cx from "classnames";
import Footer from "@/components/global/footer";
import Notification from "@/components/global/notification";
import { sfPro, inter } from "@/app/fonts";
import { SideBar } from "@/components/global/sidebar";
import {
   createContext,
   SetStateAction,
   useCallback,
   useEffect,
   useState
} from "react";
import { users as User } from "@prisma/client";
import { getServerSession } from "@/lib/authentication/user";
import { NotificationProps } from "@/components/global/notification";

interface AuthenticationContextType {
  user: User | undefined;
  fetched: boolean;
  updateUser: (_user: SetStateAction<User | undefined>) => void;
}

interface NotificationContextType {
  notification: NotificationProps | undefined;
  updateNotification: (_notification: NotificationProps) => void;
}

export const AuthenticationContext = createContext<AuthenticationContextType>({
   user: undefined,
   fetched: false,
   updateUser: () => {}
});

export const NotificationContext = createContext<NotificationContextType>({
   notification: {
      children: null,
      status: "Initial",
      message: ""
   },
   updateNotification: () => {}
});

export default function Layout({ children }: { children: React.ReactNode }) {
   // Layouts holds context for both user and potential notifications
   const [user, setUser] = useState<User | undefined>(undefined);
   const [fetched, setFetched] = useState<boolean>(false);
   const [notification, setNotification] = useState<
    NotificationProps | undefined
  >(undefined);

   const updateUser = (user: SetStateAction<User | undefined>) => {
      setUser(user);
   };

   const handleAuthentication = useCallback(async() => {
      try {
         const user = await getServerSession();
         setUser(user);
      } catch (error) {
         updateNotification({
            status: "Failure",
            message: error.message
         });

         setUser(undefined);
      }

      setFetched(true);
   }, []);

   const updateNotification = (notification: NotificationProps) => {
      setNotification(notification);
   };

   useEffect(() => {
      if (!fetched) {
         handleAuthentication();
      }

      const handleModalClickAway = (event: MouseEvent) => {
         const modals = document.getElementsByClassName("modal");
         const notifications = document.getElementsByClassName("notification");
         const topMostModal =
        modals.length > 0
           ? (modals[modals.length - 1] as HTMLDivElement)
           : null;

         if (
            topMostModal &&
        notifications.length === 0 &&
        !topMostModal.contains(event.target as HTMLElement)
         ) {
            (
          topMostModal.getElementsByClassName("modal-close")[0] as SVGElement
            ).dispatchEvent(
               new MouseEvent("click", {
                  bubbles: true,
                  cancelable: true,
                  view: window
               }),
            );
         }
      };

      document.body.addEventListener("mousedown", handleModalClickAway);

      return () => {
         document.body.removeEventListener("mousedown", handleModalClickAway);
      };
   }, [
      fetched,
      handleAuthentication
   ]);

   return (
      <html
         lang = "en"
         className = "m-0 p-0 overflow-x-hidden w-full">
         <head>
            <title>Vitality</title>
            <meta
               name = "description"
               content = "A modern fitness tracker to fuel your fitness goals"
            />
            <meta
               name = "author"
               content = "Jeffrey Cordero"
            />
            <meta
               name = "keywords"
               content = "fitness, tracker, health, wellness, vitality"
            />
            <meta
               name = "robots"
               content = "index, follow"
            />
            <link
               rel = "icon"
               href = "favcon.ico"
            />
            <meta
               name = "viewport"
               content = "width=device-width, initial-scale=1.0"
            />
         </head>
         <body
            className = {cx(
               sfPro.variable,
               inter.variable,
               "box-border m-0 p-0 overflow-x-hidden max-w-screen min-h-screen bg-gradient-to-r from-indigo-50 via-white to-indigo-50 text-black",
            )}
            suppressHydrationWarning = {true}>
            <AuthenticationContext.Provider value = {{ user, fetched, updateUser }}>
               <SideBar />
               <NotificationContext.Provider
                  value = {{ notification, updateNotification }}>
                  <div>{children}</div>
                  <div>
                     {notification !== undefined &&
                notification.status !== "Initial" && (
                        <Notification {...notification} />
                     )}
                  </div>
               </NotificationContext.Provider>
               <Footer />
            </AuthenticationContext.Provider>
         </body>
      </html>
   );
}
