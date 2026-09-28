import DemoApp from '../../../components/DemoApp';
export default function PatientPage({ params }: { params: { id: string } }) {
  return <DemoApp view="patient" patientId={params.id} />;
}
