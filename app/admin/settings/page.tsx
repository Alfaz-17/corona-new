
"use client"

import React, { useState, useEffect } from 'react';
import { Save, Loader2, Sparkles, Copyright, Type } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function SettingsPage() {
  const { data, error, mutate } = useSWR('/api/settings', fetcher);
  
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    autoBackgroundRemoval: false,
    applyWatermark: true,
    watermarkText: 'Corona Marine'
  });

  useEffect(() => {
    if (data) {
      setSettings({
        autoBackgroundRemoval: data.autoBackgroundRemoval,
        applyWatermark: data.applyWatermark,
        watermarkText: data.watermarkText
      });
    }
  }, [data]);

  const isLoading = !error && !data;

  // fetchSettings is now handled by useSWR

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        mutate();
        toast.success('Settings updated successfully');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('An error occurred while saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your store settings and preferences.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="border-accent/20 bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <CardTitle>AI Image Processing</CardTitle>
            </div>
            <CardDescription>
              Automate background removal for newly uploaded product images.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-bg">Auto Background Removal</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically process images to remove backgrounds on upload. This uses client-side AI.
                </p>
              </div>
              <Switch
                id="auto-bg"
                checked={settings.autoBackgroundRemoval}
                onCheckedChange={(checked: boolean) => setSettings({ ...settings, autoBackgroundRemoval: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Copyright className="w-5 h-5 text-accent" />
              <CardTitle>Watermarking</CardTitle>
            </div>
            <CardDescription>
              Protect your images with automated watermarks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="apply-watermark">Enable Watermarking</Label>
                <p className="text-sm text-muted-foreground">
                  Apply a text watermark to all product images before they are uploaded.
                </p>
              </div>
              <Switch
                id="apply-watermark"
                checked={settings.applyWatermark}
                onCheckedChange={(checked: boolean) => setSettings({ ...settings, applyWatermark: checked })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="watermark-text">Watermark Text</Label>
              </div>
              <Input
                id="watermark-text"
                value={settings.watermarkText}
                onChange={(e) => setSettings({ ...settings, watermarkText: e.target.value })}
                placeholder="Enter watermark text..."
                disabled={!settings.applyWatermark}
                className="max-w-md"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-accent hover:bg-accent/90 text-primary font-bold px-8"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving Changes
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
