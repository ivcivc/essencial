import { NextPageWithLayout } from "@dtos/layout";
import SignInClinica from "@views/auth/signIn/signinClinica";
import React, { useEffect } from "react";

const SignInClinicaPage: NextPageWithLayout = () => {
  useEffect(() => {
    document.title = "Login | Clínica Essencial - Sistema de Gestão";
  }, []);

  return (
    <React.Fragment>
      <SignInClinica />
    </React.Fragment>
  );
};

export default SignInClinicaPage; 