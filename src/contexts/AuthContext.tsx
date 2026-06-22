import { useState, useEffect, createContext, useContext } from "react";
import React from "react";
import { supabase } from "../api/supabase";
import { Profile } from "../types/database";
import { Alert } from "react-native";

interface AuthContextType {
  session: any | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Descomente esta linha para limpar a sessão sempre que o app abrir
    supabase.auth.signOut();
    // Verifica   sessão  ativa
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    /*
    // Escutar as  mudanças na autenticação
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });
    */
    supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      if (session) {
        setSession(session);
        fetchProfile(session.user.id);
      } else {
        setSession(null);
        setProfile(null);
      }
    });
  }, []);

  /*
  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  };
*/
  const fetchProfile = async (userId: string) => {
    console.log("Buscando perfil para userId:", userId);
    if (!userId) {
      console.log("UserId está vazio!");
      setProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    console.log("Resposta do Supabase:", data, error);
    if (error) {
      Alert.alert("Erro ao carregar perfil", error.message);
      setProfile(null);
    } else {
      setProfile(data);
    }
  };
  /*
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    // O onAuthStateChange automaticamente vai procurar o perfil
  };
*/
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    console.log("Login bem-sucedido, usuário:", data?.user?.id);
    // O onAuthStateChange vai chamar fetchProfile automaticamente
  };

  /*
  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };
  */
  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ session, profile, signIn, signOut, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
