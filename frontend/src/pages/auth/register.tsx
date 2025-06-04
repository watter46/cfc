import React from "react";
import MainLayout from "@/shared/components/layout/MainLayout.tsx";
import RegisterForm from "@/features/auth/components/RegisterForm.tsx";

const RegisterPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-field-pattern opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-space-900/90 to-space-800/90"></div>

        <div className="w-full max-w-md z-10">
          <RegisterForm />
        </div>
      </div>
    </MainLayout>
  );
};

export default RegisterPage;
