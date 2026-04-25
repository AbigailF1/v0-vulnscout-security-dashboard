'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat, type UIMessage } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Bot,
  Send,
  User,
  Sparkles,
  AlertCircle,
  RefreshCw,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIChatPanelProps {
  initialPrompt?: string;
  packageContext?: {
    name: string;
    ecosystem: string;
    version?: string;
  };
}

function getUIMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return '';
  return msg.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

export function AIChatPanel({ initialPrompt, packageContext }: AIChatPanelProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Send initial prompt when panel opens
  useEffect(() => {
    if (open && initialPrompt && messages.length === 0) {
      sendMessage({ text: initialPrompt });
    }
  }, [open, initialPrompt, messages.length, sendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageText = packageContext
      ? `[Context: ${packageContext.name} (${packageContext.ecosystem}${packageContext.version ? ` v${packageContext.version}` : ''})] ${input}`
      : input;

    sendMessage({ text: messageText });
    setInput('');
  };

  const suggestedQuestions = packageContext ? [
    `What vulnerabilities affect ${packageContext.name}?`,
    `How do I fix security issues in ${packageContext.name}?`,
    `Explain the most critical CVE for ${packageContext.name}`,
  ] : [
    'What is a CVE?',
    'How do I check if my packages are vulnerable?',
    'What does CVSS score mean?',
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Ask AI
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            VulnScout AI Assistant
          </SheetTitle>
          <SheetDescription>
            Ask questions about vulnerabilities, CVEs, and security best practices.
          </SheetDescription>
        </SheetHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="space-y-4">
              <div className="text-center py-8">
                <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">How can I help you?</h3>
                <p className="text-sm text-muted-foreground">
                  I can explain vulnerabilities, suggest patches, and help you understand security issues.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Suggested questions</p>
                {suggestedQuestions.map((question, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage({ text: question })}
                    className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' && 'flex-row-reverse'
                  )}
                >
                  <Avatar className={cn(
                    'h-8 w-8 shrink-0 flex items-center justify-center',
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </Avatar>
                  <div
                    className={cn(
                      'rounded-lg p-3 max-w-[85%]',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {message.parts?.map((part, i) => {
                      if (part.type === 'text') {
                        return (
                          <p key={i} className="text-sm whitespace-pre-wrap">
                            {part.text}
                          </p>
                        );
                      }
                      if (part.type === 'tool-invocation') {
                        return (
                          <div key={i} className="mt-2 p-2 rounded bg-background/50 text-xs">
                            <Badge variant="secondary" className="mb-1">
                              {part.toolInvocation.toolName}
                            </Badge>
                            {part.toolInvocation.state === 'result' && (
                              <pre className="text-xs overflow-auto max-h-32 mt-1">
                                {JSON.stringify(part.toolInvocation.result, null, 2).slice(0, 200)}...
                              </pre>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0 bg-muted flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </Avatar>
                  <div className="rounded-lg p-3 bg-muted">
                    <Spinner size="sm" />
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">
                {error.message || 'An error occurred. Please try again.'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => {
                  if (messages.length > 0) {
                    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
                    if (lastUserMessage) {
                      sendMessage({ text: getUIMessageText(lastUserMessage) });
                    }
                  }
                }}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about vulnerabilities..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={!input.trim() || isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Responses are AI-generated and grounded in OSV data.
          </p>
        </form>
      </SheetContent>
    </Sheet>
  );
}

// Floating chat button variant
export function AIChatButton({ ...props }: AIChatPanelProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AIChatPanel {...props} />
    </div>
  );
}
