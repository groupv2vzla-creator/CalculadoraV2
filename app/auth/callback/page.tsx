"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function AuthCallback() {
 const [message,setMessage]=useState("Validando tu acceso a Group V2…");
 useEffect(()=>{
  let alive=true;
  async function complete(){
   try{
    const url=new URL(window.location.href);
    const error=url.searchParams.get("error_description")||url.searchParams.get("error");
    if(error)throw new Error(error.replace(/\+/g," "));
    const tokenHash=url.searchParams.get("token_hash");
    const code=url.searchParams.get("code");
    if(tokenHash){
     const {error}=await supabase.auth.verifyOtp({token_hash:tokenHash,type:"email"});
     if(error)throw error;
    }else if(code){
     const {error}=await supabase.auth.exchangeCodeForSession(code);
     if(error)throw error;
    }else if(url.hash.includes("access_token=")){
     const params=new URLSearchParams(url.hash.slice(1));
     const access_token=params.get("access_token");
     const refresh_token=params.get("refresh_token");
     if(!access_token||!refresh_token)throw new Error("El enlace está incompleto.");
     const {error}=await supabase.auth.setSession({access_token,refresh_token});
     if(error)throw error;
    }
    const {data:{session},error:sessionError}=await supabase.auth.getSession();
    if(sessionError)throw sessionError;
    if(!session)throw new Error("No se pudo completar la sesión. Solicita un enlace nuevo y ábrelo directamente en Safari o Chrome.");
    if(alive)window.location.replace("/");
   }catch(err){if(alive)setMessage((err instanceof Error?err.message:"No se pudo validar el acceso")+". Vuelve a la calculadora y solicita un enlace nuevo.");}
  }
  void complete();
  return()=>{alive=false};
 },[]);
 return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"#15101f",color:"#fff",textAlign:"center"}}><div><h1>Group V2 💜</h1><p>{message}</p><a href="/" style={{color:"#60c9ff"}}>Volver a la calculadora</a></div></main>;
}
