import React from 'react';
import ClinicProfileClient from './components/ClinicProfileClient';

export const metadata = {
  title: 'Clinic Profile | TheraTreat',
  description: 'View clinic details, therapists, services, and book a session.'
};

export default async function ClinicProfilePage({ params }: { params: { id: string } }) {
  // In a future iteration we can server-fetch minimal SEO data for the clinic here.
  return <ClinicProfileClient clinicId={params.id} />;
}
