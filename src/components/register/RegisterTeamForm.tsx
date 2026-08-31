"use client";

import { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { registerTeam } from "@/services/register/team.mutations";
import { supabase } from "@/lib/supabase";

interface Sport {
  id: number;
  name: string;
}

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required("Team name is required").min(2).max(200),
  sport_id: Yup.number().required("Sport is required"),
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

export default function RegisterTeamForm() {
  const [serverError, setServerError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSports = async () => {
      const { data } = await supabase
        .from("sports")
        .select("id, name")
        .order("name");
      if (data) setSports(data as Sport[]);
      setLoading(false);
    };
    fetchSports();
  }, []);

  if (submitted) {
    return (
      <div className="text-center">
        <p className="text-app-text font-medium">Registration submitted!</p>
        <p className="mt-2 text-sm text-gray-500">
          Your team is pending approval. You&apos;ll be able to log in once an
          admin activates it.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  return (
    <Formik
      initialValues={{
        name: "",
        sport_id: "",
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        contact: "",
      }}
      validationSchema={RegisterSchema}
      onSubmit={async (values, { setSubmitting }) => {
        setServerError("");

        const result = await registerTeam({
          name: values.name,
          sport_id: Number(values.sport_id),
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
      {({ isSubmitting, values, setFieldValue }) => (
        <Form className="flex flex-col gap-6">
          <Input
            name="name"
            label="Team Name"
            placeholder="e.g. City Warriors"
          />

          <div className="flex flex-col gap-2">
            <label
              htmlFor="sport_id"
              className="text-sm font-medium text-app-text"
            >
              Sport
            </label>
            <select
              id="sport_id"
              name="sport_id"
              value={values.sport_id}
              onChange={(e) => setFieldValue("sport_id", e.target.value)}
              className="h-8 rounded-lg border-2 border-input-border px-4 text-base text-app-text outline-none"
            >
              <option value="">Select sport</option>
              {sports.map((sport) => (
                <option key={sport.id} value={sport.id}>
                  {sport.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            name="username"
            label="Username"
            placeholder="e.g. city_warriors"
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
            placeholder="team@example.com"
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
