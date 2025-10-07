import React from 'react';
import ClinicProfileClient from './components/ClinicProfileClient';

export const metadata = {
  title: 'Clinic Profile | TheraTreat',
  description: 'View clinic details, therapists, services, and book a session.'
};

interface ClinicPageProps {
  params?: any; // loosen to avoid Next PageProps constraint mismatch in build
}

export default function ClinicProfilePage({ params }: ClinicPageProps) {
  const id = params?.id as string;
  return <ClinicProfileClient clinicId={id} />;
}
