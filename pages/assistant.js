import AIAssistant from '../components/AIAssistant';

export default function AssistantPage({ resume }) {
  return (
    <div className="py-6 max-w-4xl mx-auto space-y-8">
      
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-400">Communication Node</p>
        <h2 className="text-3xl font-extrabold text-white tracking-tight mt-2">Thermal AI Consultant</h2>
        <p className="text-slate-300 text-sm mt-1">
          Chat with the combustion core AI coach about career guidance, resume improvements, or interview preparation.
        </p>
      </div>

      <div className="w-full">
        <AIAssistant resume={resume} />
      </div>

    </div>
  );
}
