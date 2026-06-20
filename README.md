# Projeto Estágio 3 : Faturei

# Este meu projeto é um aplicativo que otimiza o fluxo nos processos de um pequeno ponto comercial (lanchonete da minha tia) e com objetivo também do gerenciamento de caixa . Os processos se resumem em 4 perfis :

## Atendente,

#### Faz os pedidos para todos os clientes pelo app , tanto os clientes presenciais quanto os clientes online (as pessoas sao burra e nao sabe e nem quer aprender usar o app para fazer pedido direito , por isso quem faz é o atendente) .

## Cozinheira,

#### Recebe os pedidos e vai fazendo as merenda e trocando o status (nao feito , fazendo , feito , delivery a caminho , entregue , cancelado)

# Motoboy,

#### recebe os pedidos prontos e o app redireciona para o waze automaticamente ao endereço que deve ser entregue

# Administrador

#### Este visualiza através de um dashboard a performace de vendas e ranking de produtos .

## Bibliotecas

### @supabase/supabase-js: conectar ao banco PostgreSQL via API.

### @react-native-async-storage/async-storage: armazenar sessão do usuário.

### react-native-vector-icons: ícones nos botões (opcional, você pode usar texto puro).

### @react-navigation/\*: sistema de navegação entre telas.

### react-native-screens

### e react-native-safe-area-context: dependências do navigation.

### expo-av: tocar som de alerta na cozinha.

### expo-linking: abrir mapas externos (Waze/Google Maps).

# Sistema de arquivos

```
GestaoTiaMaria/
├── assets/
│   └── alert.mp3               (baixe um som curto de notificação)
├── src/
│   ├── api/
│   │   └── supabase.ts
│   ├── components/
│   │   └── (opcional, reutilizáveis)
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   └── (opcional, hooks customizados)
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   ├── KitchenStack.tsx
│   │   ├── AttendantStack.tsx
│   │   ├── DeliveryStack.tsx
│   │   └── AdminStack.tsx
│   ├── screens/
│   │   ├── auth/
│   │   │   └── Login.tsx
│   │   ├── kitchen/
│   │   │   └── KitchenPanel.tsx
│   │   ├── attendant/
│   │   │   ├── CreateOrder.tsx
│   │   │   └── CustomerPicker.tsx (opcional)
│   │   ├── delivery/
│   │   │   ├── DeliveryQueue.tsx
│   │   │   └── DeliveryDetails.tsx
│   │   └── admin/
│   │       ├── Dashboard.tsx
│   │       ├── Expenses.tsx
│   │       ├── UserManagement.tsx
│   │       ├── Reports.tsx
│   │       └── ProductsCRUD.tsx
│   └── types/
│       └── database.ts
├── App.tsx
├── app.json
├── package.json
└── tsconfig.json
```

# Estrutura do Banco de dados

### armazenar clientes, pedidos, produtos e dados para o dashboard (faturamento, ranking de produtos).

```
-- USUÁRIOS DO APP (qualquer perfil)
users
  id            PK
  name
  phone
  role          ENUM('cozinheira','atendente','motoboy','admin')
  password_hash
  active        BOOLEAN
  created_at
  updated_at

-- CLIENTES (consumidores finais)
customers
  id            PK
  name
  phone
  address       TEXT (ou campos separados: street, number, neighborhood, city)
  notes
  created_by    FK -> users.id (atendente que cadastrou)
  created_at
  updated_at

-- PRODUTOS (cardápio)
products
  id            PK
  name
  category      VARCHAR(50)
  price         DECIMAL(10,2)
  active        BOOLEAN (para desativar sem excluir)
  created_at
  updated_at

-- PEDIDOS
orders
  id            PK
  order_number  INTEGER (gerado sequencialmente, fácil para anotar na sacola)
  customer_id   FK -> customers.id
  attendant_id  FK -> users.id (atendente que criou)
  status        ENUM('nao_feito','fazendo','feito','em_entrega','entregue','cancelado')
  notes         TEXT (observações como "sem cebola")
  payment_method VARCHAR(30) (dinheiro, pix, etc.)
  total_value   DECIMAL(10,2) (calculado ou armazenado)
  created_at
  updated_at

-- ITENS DO PEDIDO
order_items
  id            PK
  order_id      FK -> orders.id ON DELETE CASCADE
  product_id    FK -> products.id
  quantity      INTEGER
  unit_price    DECIMAL(10,2) (preço no momento, evita perda histórica)
  notes         TEXT (ex: "ponto da carne")
  is_altered    BOOLEAN DEFAULT FALSE (controle de alteração pós-criação)

-- HISTÓRICO DE STATUS (para auditoria e análise)
order_status_log
  id            PK
  order_id      FK -> orders.id
  old_status    VARCHAR(30)
  new_status    VARCHAR(30)
  changed_by    FK -> users.id
  changed_at    TIMESTAMP

-- ENTREGAS (atribuição única ao motoboy)
deliveries
  id            PK
  order_id      FK -> orders.id (UNIQUE, um pedido = uma entrega)
  motoboy_id    FK -> users.id (NULL até ser aceito; ao aceitar, preenche)
  accepted_at   TIMESTAMP
  delivered_at  TIMESTAMP
  delivery_fee  DECIMAL(10,2)

-- DESPESAS (controle financeiro)
expenses
  id            PK
  description   TEXT
  amount        DECIMAL(10,2)
  expense_date  DATE
  category      VARCHAR(50)
  created_by    FK -> users.id
  created_at
```

## Versão 1.0

#### bugs

##### Porque depois de eu conseguir logar um usuário no expo go ele sempre vai automaticamente selecionar o primeiro usuário cadastrado ? eu quero poder logar emoutros usuarios também . Na verdade o que aconteceu é que depois de eu consegui fazer login com um usuário "atendente@tiamaria.com" "123456" , mesmo depois de eu ter reiniciado o projeto no terminal do notebook para tentar fazer login com outro profile , ele depois da primeira tela de login nunca mais apareceu novamente a tela para fazer login com talvez outro profile. depois que o projeto foi feito assim "npx expo start --clear" e ele foi executado no expo go ele redireciona automaticamente para primeiro usuario que fez login

##### A tela do app do perfil atendente não tem o botão logOut para sair da conta e voltar para tela de login. E gostaria de fazer assim , tipo no mesmo app a pessoa consegue cadastrar outro usuário da tabela profile , e simplesmente ter uma opãção para pessoa querer escolher qual dos profile ela quer usar , podendo trocar de um para o outro ( \*\*\*\*somente se no caso foi feito login no mesmo celular dos respectivos profile)

##### Outro defeito é que depois que aparece outra tela em 1,2 segundos antes de aparecer a tela do perfil atentente .

##### Outra coisa na tela do atendente ele colocou o botão 'Enviar pedido' no mesmo lugar da viewport que tem os botões nativos do celular [], () , < , deve ser colocado acima deles tipo - como se o bottom tivesse 80% do seu tamanho distante do bottom 0 da viewport do celular.

##### Outra coisa que eu errei é dentro da tela do atentende nao aparece a opção cadastrar novo cliente soaparece o input para digitar o telefone de um clinete que ja esta cadastrado.

##### Adicionar uma funcionalidade para conseguir buscar o cliente ja cadastrado apartir da rua do seu endereço também além de so perquisar por telefone ou nome . O principal seria buscar por nome e ou endereço

##### Política RLS muito permissiva – A política atual "Allow all for authenticated" deixa qualquer autenticado ver todos os perfis. Se a consulta retorna uma lista e você usa .single(), pode pegar o primeiro se o filtro falhar.

# Correções

### 1. Vamos fazer uma depuração controlada e ajustar o código para garantir que cada login carregue o perfil correto.

#### 1. Adicione logs para identificar o erro

##### No AuthContext.tsx, modifique a função fetchProfile temporariamente:

#### 2. Forçar limpeza total da sessão antes de logar

##### Para garantir que nenhum resquício de sessão antiga interfira, faça logout explícito ao iniciar o app (apenas para teste). Adicione no useEffect inicial do AuthProvider:

#### 3. Corrija o fluxo de autenticação para evitar sessão presa

##### Atualize o AuthContext.tsx para garantir que, ao receber uma nova sessão, o perfil seja buscado corretamente e que o estado anterior seja limpo.

#### 4. Verifique os UUIDs cadastrados

##### É possível que você tenha criado os usuários no Authentication, mas na tabela profiles os IDs estejam trocados. Faça uma consulta para confirmar:

#### 5. Ajuste a política RLS (recomendado)

##### Para evitar que um usuário veja perfis alheios (e garantir que a consulta retorne apenas o dele), recrie as políticas com um filtro de dono:

#### 6. Teste o login com outro usuário
