import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { frameworks } from '@/lib/frameworks';
import AppHeader from '@/components/layout/app-header';

export default function FrameworksPage() {
  return (
    <>
      <AppHeader />
      <div className="max-w-5xl mx-auto pt-24 pb-10 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Prompt Frameworks</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {frameworks.map((fw) => (
            <Card key={fw.id} className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  {fw.emoji && <span className="text-2xl">{fw.emoji}</span>}
                  {fw.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-2">
                <div className="text-sm text-muted-foreground mb-2"><b>When to use:</b> {fw.whenToUse}</div>
                <div className="text-sm"><b>Structure:</b> {fw.structure}</div>
                <div className="text-xs mt-2 bg-muted p-2 rounded"><b>Example:</b> {fw.example}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
} 