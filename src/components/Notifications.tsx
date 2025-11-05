import { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { api, SwapRequest } from "../lib/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Calendar, Check, X, Loader2, Clock, User } from "lucide-react";
import { format } from "date-fns";

export function Notifications() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchRequests = async () => {
    if (!user) {
      console.log("❌ No user found");
      return;
    }
    
    setLoading(true);
    try {
      console.log("🔄 Fetching swap requests for user ID:", user.id);
      const data = await api.getSwapRequests(user.id);
      console.log("✅ API Response:", data);
      console.log("📊 Number of requests received:", data.length);
      setRequests(data);
    } catch (error) {
      console.error("❌ Failed to fetch swap requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("🎯 Notifications component mounted, user:", user);
    fetchRequests();
  }, [user]);

  const handleResponse = async (requestId: number, accept: boolean) => {
    setProcessingId(requestId);
    try {
      await api.processRequest({
        swapRequestId: requestId,
        acceptanceStatus: accept,
      });
      await fetchRequests();
    } catch (error) {
      console.error("Failed to process request:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDateTime = (dateTime: string) => {
    try {
      return format(new Date(dateTime), "MMM d, yyyy h:mm a");
    } catch {
      return dateTime;
    }
  };

  // Since backend only returns requests where current user is the target
  const incomingRequests = requests;
  const outgoingRequests = []; // Backend doesn't provide outgoing requests

  console.log("🎯 Current state - Loading:", loading, "Incoming requests:", incomingRequests.length);

  return (
    <div className="space-y-6">
      <div>
        <h2>Swap Requests</h2>
        <p className="text-gray-600 mt-1">
          Manage your incoming and outgoing Slot swap requests
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading swap requests...</p>
        </div>
      ) : (
        <Tabs defaultValue="incoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="incoming">
              Incoming ({incomingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="outgoing">
              Outgoing ({outgoingRequests.length})
            </TabsTrigger>
          </TabsList>

          {/* INCOMING REQUESTS - Where you are the target user */}
          <TabsContent value="incoming" className="mt-6 space-y-4">
            {incomingRequests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No incoming requests</p>
                  <p className="text-gray-500 mt-1">When someone requests to swap with you, it will appear here</p>
                  <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
                    <p>User ID: {user?.id}</p>
                    <p>Total requests from API: {requests.length}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              incomingRequests.map((request) => (
                <Card key={request.requestId} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Swap Request #{request.requestId}</CardTitle>
                      <Badge variant={request.status === "SWAP_PENDING" ? "default" : "secondary"}>
                        {request.status}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      User #{request.requestorId} wants to swap Slots with you
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-semibold text-gray-900">{request.title}</p>
                      <div className="flex items-center gap-2 text-gray-600 mt-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatDateTime(request.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{formatDateTime(request.endTime)}</span>
                      </div>
                    </div>
                    
                    {request.status === "SWAP_PENDING" && (
                      <div className="flex gap-2 mt-4">
                        <Button
                          className="flex-1 gap-2"
                          onClick={() => handleResponse(request.requestId, true)}
                          disabled={processingId === request.requestId}
                        >
                          {processingId === request.requestId ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 gap-2"
                          onClick={() => handleResponse(request.requestId, false)}
                          disabled={processingId === request.requestId}
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* OUTGOING REQUESTS - Currently empty since backend doesn't provide them */}
          <TabsContent value="outgoing" className="mt-6">
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No outgoing requests</p>
                <p className="text-gray-500 mt-1">
                  Backend currently only shows incoming requests. Outgoing requests feature coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}