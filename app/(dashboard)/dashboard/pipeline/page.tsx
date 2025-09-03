"use client";

import { useState, useEffect } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { getPipelineData } from "@/server/actions/pipeline";
import { updateDealStage } from "@/server/actions/deals";
import { DragAndDropProvider } from "@/components/ui/drag-and-drop-context";
import {
  DealWithRelations,
  DroppableStageColumn,
} from "@/components/features/crm/droppable-stage-column";
import { DealDialog } from "@/components/features/crm/deal-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/types/supabase";

// Type for deal with relations
// type DealWithRelations = Tables<"deals"> & {
//   contacts?: Tables<"contacts"> | null;
//   deal_stages?: Tables<"deal_stages"> | null;
// };

// Type for deals grouped by stage
type DealsGroupedByStage = {
  stage: Tables<"deal_stages">;
  deals: DealWithRelations[];
};

export default function PipelinePage() {
  const [dealsByStage, setDealsByStage] = useState<
    DealsGroupedByStage[] | null
  >(null);
  const [dealStages, setDealStages] = useState<Tables<"deal_stages">[] | null>(
    null
  );
  const [contacts, setContacts] = useState<Tables<"contacts">[] | null>(null);
  const [editingDeal, setEditingDeal] = useState<DealWithRelations | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getPipelineData();
        setDealsByStage(result.dealsByStage);
        setDealStages(result.dealStages);
        setContacts(result.contacts);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !dealsByStage) return;

    const dealId = active.id as string;
    const newStageId = over.id as string;

    // Find the deal being moved
    const deal = dealsByStage
      .flatMap((stage) => stage.deals)
      .find((d) => d.id === dealId);

    if (!deal || deal.stage_id === newStageId) return;

    // Optimistically update UI
    setDealsByStage((prevStages) => {
      if (!prevStages) return null;

      return prevStages.map((stageData) => {
        if (stageData.stage.id === deal.stage_id) {
          // Remove from current stage
          return {
            ...stageData,
            deals: stageData.deals.filter((d) => d.id !== dealId),
          };
        } else if (stageData.stage.id === newStageId) {
          // Add to new stage
          return {
            ...stageData,
            deals: [...stageData.deals, { ...deal, stage_id: newStageId }],
          };
        }
        return stageData;
      });
    });

    // Update on server
    try {
      const result = await updateDealStage(dealId, newStageId);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        // Revert optimistic update by reloading data
        const freshData = await getPipelineData();
        setDealsByStage(freshData.dealsByStage);
      } else {
        toast({
          title: "Success",
          description: "Deal stage updated successfully",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update deal stage",
        variant: "destructive",
      });
      // Revert optimistic update
      const freshData = await getPipelineData();
      setDealsByStage(freshData.dealsByStage);
    }
  };

  const totalDeals =
    dealsByStage?.reduce((sum, stage) => sum + stage.deals.length, 0) || 0;
  const totalValue =
    dealsByStage?.reduce(
      (sum, stage) =>
        sum +
        stage.deals.reduce(
          (stageSum, deal: DealWithRelations) => stageSum + (deal.value || 0),
          0
        ),
      0
    ) || 0;

  return (
    <DragAndDropProvider onDragEnd={handleDragEnd}>
      <div className="container mx-auto py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pipeline</h1>
            <p className="text-muted-foreground">
              Track deals through your sales stages
            </p>
          </div>
          <DealDialog
            stages={dealStages || []}
            contacts={contacts || []}
            trigger={
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Deal
              </Button>
            }
          />
        </div>

        {/* Pipeline Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDeals}</div>
              <p className="text-xs text-muted-foreground">
                Active deals in pipeline
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pipeline Value
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Total potential revenue
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Kanban Board */}
        {dealsByStage && dealsByStage.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dealsByStage.map((stageData: DealsGroupedByStage) => (
              <DroppableStageColumn
                key={stageData.stage.id}
                stage={stageData.stage}
                deals={stageData.deals}
                onEditDeal={(deal: DealWithRelations) => {
                  setEditingDeal(deal);
                }}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  No pipeline stages yet
                </h3>
                <p>
                  Your deal stages will appear here once they&apos;re
                  configured.
                </p>
              </div>
              <DealDialog
                stages={dealStages || []}
                contacts={contacts || []}
                trigger={
                  <Button>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Your First Deal
                  </Button>
                }
              />
            </CardContent>
          </Card>
        )}

        {/* Pipeline Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Pipeline Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium mb-2">How to use the pipeline:</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Each column represents a deal stage</li>
                  <li>• Click on a deal card to view details</li>
                  <li>• Use the dropdown menu to move deals between stages</li>
                  <li>• Add new deals using the &quot;Add Deal&quot; button</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Pipeline metrics:</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Total deals: {totalDeals}</li>
                  <li>• Pipeline value: ${totalValue.toLocaleString()}</li>
                  <li>• Active stages: {dealStages?.length || 0}</li>
                  <li>
                    • Average deal size: $
                    {totalDeals > 0
                      ? Math.round(totalValue / totalDeals).toLocaleString()
                      : 0}
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Deal Dialog */}
        {editingDeal && (
          <DealDialog
            deal={editingDeal}
            stages={dealStages || []}
            contacts={contacts || []}
            trigger={<div />}
            isOpen={true}
            onClose={() => setEditingDeal(null)}
          />
        )}
      </div>
    </DragAndDropProvider>
  );
}
