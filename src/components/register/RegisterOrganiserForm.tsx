"use client";

import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { registerOrganiser } from "@/services/register/organiser.mutations";

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required("Name is required").min(2).max(200),
  username: Yup.string()
    .required("Username is required")
    .min(3)
    .max(50)
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Only letters, numbers, and underscores allowed",
    ),
  password: Yup.string().required("Password is required").min(6),
  confirmPassword: Yup.string()
    .required("Confirm your password")
    .oneOf([Yup.ref("password")], "Passwords must match"),
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  contact: Yup.string()
    .required("Contact number is required")
    .matches(/^\d{10}$/, "Enter a valid 10-digit contact number"),
});

export default function RegisterOrganiserForm() {
  const [serverError, setServerError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="text-center">
        <p className="text-app-text font-medium">Registration submitted!</p>
        <p className="mt-2 text-sm text-gray-500">
          Your account is pending approval. You&apos;ll be able to log in once
          an admin activates it.
        </p>
      </div>
    );
  }

  return (
    <Formik
      initialValues={{
        name: "",
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        contact: "",
      }}
      validationSchema={RegisterSchema}
      onSubmit={async (values, { setSubmitting }) => {
        setServerError("");

        const result = await registerOrganiser({
          name: values.name,
          username: values.username,
          password: values.password,
          email: values.email,
          contact: Number(values.contact),
        });

        setSubmitting(false);

        if (result.error) {
          setServerError(result.error);
          return;
        }

        setSubmitted(true);
      }}
    >
      {({ isSubmitting }) => (
        <Form className="flex flex-col gap-6">
          <Input
            name="name"
            label="Organisation Name"
            placeholder="e.g. City Sports Club"
          />
          <Input
            name="username"
            label="Username"
            placeholder="e.g. city_sports_club"
          />
          <Input
            name="password"
            label="Password"
            type="password"
            placeholder="Min 6 characters"
          />
          <Input
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Re-enter password"
          />
          <Input
            name="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
          />
          <Input
            name="contact"
            label="Contact Number"
            placeholder="10-digit number"
          />

          {serverError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {serverError}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            loadingText="Registering..."
          >
            Register
          </Button>
        </Form>
      )}
    </Formik>
  );
}
