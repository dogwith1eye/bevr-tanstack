import { Result, useAtom } from "@effect-atom/atom-react";
import { helloAtom } from "@/lib/atoms/hello-atom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponseCard } from "@/components/ui/response-card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/rest')({
  component: RestComponent,
})

function RestComponent() {
  const [response, getHello] = useAtom(helloAtom);

  const handleApiCall = () => {
    getHello();
  };
  return (
    <div className="flex h-full flex-col gap-4">
      <Card className="h-auto">
        <CardHeader className="border-b border-border">
          <CardTitle>REST API</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Button className="w-full" onClick={handleApiCall} size="lg">
            Call REST API
          </Button>
        </CardContent>
      </Card>
      {Result.builder(response)
        .onSuccess((data) => (
          <ResponseCard
            state="completed"
            title="REST API Response"
            className="flex-1"
          >
            <pre>
              <code>
                Message: {data.message}
                {"\n"}
                Success: {data.success.toString()}
              </code>
            </pre>
          </ResponseCard>
        ))
        .onFailure((error) => (
          <ResponseCard
            state="error"
            title="REST API Response"
            className="flex-1"
          >
            <pre>
              <code>
                Error: {error._tag}
                {"\n"}
                Details: {JSON.stringify(error ?? {}, null, 2)}
              </code>
            </pre>
          </ResponseCard>
        ))
        .onInitial(() => (
          <ResponseCard title="REST API Response" className="flex-1">
            Click the button above to test the REST API
          </ResponseCard>
        ))
        .orNull()}
    </div>
  );
};
