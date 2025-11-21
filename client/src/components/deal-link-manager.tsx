import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface DealLink {
  id: string;
  code: string;
  clicks: number;
  conversions: number;
}

interface ReferralLinkManagerProps {
  userReferralCode: string;
  links: DealLink[];
  onCreateLink: () => void;
  onUpdateLink: (id: string, data: any) => void;
  onDeleteLink: (id: string) => void;
}

export default function ReferralLinkManager({
  userReferralCode,
  links,
  onCreateLink,
  onUpdateLink,
  onDeleteLink,
}: ReferralLinkManagerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
            <code className="flex-1 text-sm break-all">{userReferralCode}</code>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCopy(userReferralCode)}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Share this link to invite partners to join your network
          </p>
        </CardContent>
      </Card>

      {links.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {links.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div>
                  <code className="text-sm">{link.code}</code>
                  <p className="text-xs text-gray-600 mt-1">
                    {link.clicks} clicks • {link.conversions} conversions
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(link.code)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteLink(link.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Button onClick={onCreateLink} className="w-full" size="lg">
        <Plus className="w-4 h-4 mr-2" />
        Create New Link
      </Button>
    </div>
  );
}
