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
