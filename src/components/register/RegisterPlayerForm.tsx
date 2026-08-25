"use client";

import { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { registerPlayer } from "@/services/register/player.mutations";
import { supabase } from "@/lib/supabase";

interface Sport {
  id: number;
  name: string;
}

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required("Name is required").min(2).max(200),
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  contact: Yup.string()
    .required("Contact number is required")
    .matches(/^\d{10}$/, "Enter a valid 10-digit contact number"),
  sport_id: Yup.number().required("Sport is required"),
  id_type: Yup.string().required("ID type is required"),
  id_proof: Yup.string().required("ID proof number is required").max(50),
  birthdate: Yup.string()
    .required("Birthdate is required")
    .test("is-past", "Birthdate must be before today", (value) => {
      if (!value) return true;
      return value < getTodayString();
    }),
  height: Yup.number().min(0).nullable(),
  weight: Yup.number().min(0).nullable(),
});

export default function RegisterPlayerForm() {
  const [serverError, setServerError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const today = getTodayString();

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
          Your profile is pending approval. You&apos;ll be added to a team once
          an admin activates it.
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
        email: "",
        contact: "",
        sport_id: "",
        id_type: "",
        id_proof: "",
        birthdate: "",
        height: "",
        weight: "",
      }}
      validationSchema={RegisterSchema}
      onSubmit={async (values, { setSubmitting }) => {
        setServerError("");

        const result = await registerPlayer({
          name: values.name,
          email: values.email,
          contact: Number(values.contact),
          sport_id: Number(values.sport_id),
          id_type: values.id_type as
            | "aadhar"
            | "pan"
            | "school_id"
            | "college_id",
          id_proof: values.id_proof,
          birthdate: values.birthdate,
          height: values.height ? Number(values.height) : undefined,
          weight: values.weight ? Number(values.weight) : undefined,
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
            label="Full Name"
            placeholder="e.g. Rohan Sharma"
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

          <div className="flex flex-col gap-2">
            <label
              htmlFor="id_type"
              className="text-sm font-medium text-app-text"
            >
              ID Type
            </label>
            <select
              id="id_type"
              name="id_type"
              value={values.id_type}
              onChange={(e) => setFieldValue("id_type", e.target.value)}
              className="h-8 rounded-lg border-2 border-input-border px-4 text-base text-app-text outline-none"
            >
              <option value="">Select ID type</option>
              <option value="aadhar">Aadhar</option>
              <option value="pan">PAN</option>
              <option value="school_id">School ID</option>
              <option value="college_id">College ID</option>
            </select>
          </div>

          <Input
            name="id_proof"
            label="ID Proof Number"
            placeholder="e.g. 1234 5678 9012"
          />
          <Input name="birthdate" label="Birthdate" type="date" max={today} />
          <Input
            name="height"
            label="Height (cm)"
            type="number"
            placeholder="Optional"
          />
          <Input
            name="weight"
            label="Weight (kg)"
            type="number"
            placeholder="Optional"
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
