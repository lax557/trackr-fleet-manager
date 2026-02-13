import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Send, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const suggestions = [
  'Qual a margem operacional dos últimos 3 meses?',
  'Quais veículos geram mais despesa de manutenção?',
  'Previsão de fluxo de caixa para os próximos 30 dias',
  'Análise de inadimplência por motorista',
];

export default function FinancialAIPage() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSend = () => {
    if (!prompt.trim()) return;
    setMessages(prev => [
      ...prev,
      { role: 'user', content: prompt },
      { role: 'assistant', content: 'Esta funcionalidade será integrada com uma API de IA (GPT ou Gemini) em breve. Por enquanto, este é um placeholder para demonstrar a interface do consultor financeiro.' },
    ]);
    setPrompt('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Consultor Financeiro IA</h1>
        <p className="text-sm text-muted-foreground">Faça perguntas sobre as finanças da sua frota</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <Card className="flex flex-col" style={{ height: '500px' }}>
            <CardContent className="flex-1 min-h-0 p-4 overflow-hidden">
              <ScrollArea className="h-full">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-16">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Bot className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Olá! Como posso ajudar?</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                      Pergunte sobre receitas, despesas, margens, tendências ou qualquer análise financeira da frota.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 pr-2">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Faça uma pergunta..."
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  className="min-h-[44px] max-h-[100px] resize-none"
                  rows={1}
                />
                <Button onClick={handleSend} size="icon" className="shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">Sugestões</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suggestions.map(s => (
                  <Button
                    key={s}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs h-auto py-2 text-left whitespace-normal"
                    onClick={() => { setPrompt(s); }}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
