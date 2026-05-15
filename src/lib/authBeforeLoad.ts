import { getSessionFn } from "./getSession"
import { redirect, type ValidateRedirectOptions } from '@tanstack/react-router'

export const  authBeforeLoader = async (
    { redirectToIfAuth, redirectToIfNotAuth }:
    { 
        redirectToIfAuth?: ValidateRedirectOptions, 
        redirectToIfNotAuth?: ValidateRedirectOptions 
    }) => {
    // is Authenticated? If so, redirect to profile
    const session = await getSessionFn()
    if (session.data?.user && redirectToIfAuth) {
      throw redirect(redirectToIfAuth)
    } 

    if(redirectToIfNotAuth) {
      throw redirect(redirectToIfNotAuth)
    }
  }
