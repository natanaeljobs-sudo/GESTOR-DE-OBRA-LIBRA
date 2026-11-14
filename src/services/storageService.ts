import { supabase } from '../lib/supabase';

export interface UploadResult {
  url: string | null;
  path: string | null;
  error: string | null;
}

export const StorageService = {
  /**
   * Faz upload de um arquivo de comprovante (recibo/nota/foto) para o bucket 'comprovantes' no Supabase.
   */
  async uploadComprovante(file: File, obraId?: string): Promise<UploadResult> {
    try {
      const fileExt = file.name.split('.').pop();
      const sanitizedName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .toLowerCase();
      const timestamp = Date.now();
      const folder = obraId ? obraId : 'geral';
      const filePath = `${folder}/${timestamp}_${sanitizedName}`;

      const { data, error } = await supabase.storage
        .from('comprovantes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Erro no upload para Supabase Storage:', error);
        return { url: null, path: null, error: error.message };
      }

      // Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from('comprovantes')
        .getPublicUrl(data.path);

      return {
        url: publicUrlData.publicUrl,
        path: data.path,
        error: null,
      };
    } catch (err: any) {
      console.error('Exceção ao fazer upload de comprovante:', err);
      return { url: null, path: null, error: err.message || 'Erro inesperado no upload' };
    }
  },

  /**
   * Remove um comprovante do storage pelo path
   */
  async removerComprovante(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from('comprovantes')
        .remove([filePath]);

      if (error) {
        console.error('Erro ao excluir comprovante do Storage:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Exceção ao excluir comprovante:', err);
      return false;
    }
  }
};
