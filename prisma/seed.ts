import { PrismaClient, MallCode, InquiryType, InquiryStatus, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Users
  const adminPassword = await bcrypt.hash('admin1234', 10)
  const staffPassword = await bcrypt.hash('staff1234', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: '管理者 太郎',
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: UserRole.admin,
    },
  })

  const staff1 = await prisma.user.upsert({
    where: { email: 'staff1@example.com' },
    update: {},
    create: {
      name: '担当 花子',
      email: 'staff1@example.com',
      passwordHash: staffPassword,
      role: UserRole.staff,
    },
  })

  const staff2 = await prisma.user.upsert({
    where: { email: 'staff2@example.com' },
    update: {},
    create: {
      name: '担当 次郎',
      email: 'staff2@example.com',
      passwordHash: staffPassword,
      role: UserRole.staff,
    },
  })

  // Malls
  const rakuten = await prisma.mall.upsert({
    where: { code: MallCode.rakuten },
    update: {},
    create: { name: '楽天市場', code: MallCode.rakuten, apiEndpoint: 'https://api.rms.rakuten.co.jp' },
  })
  const yahoo = await prisma.mall.upsert({
    where: { code: MallCode.yahoo },
    update: {},
    create: { name: 'Yahoo!ショッピング', code: MallCode.yahoo, apiEndpoint: 'https://circus.shopping.yahooapis.jp' },
  })
  const amazon = await prisma.mall.upsert({
    where: { code: MallCode.amazon },
    update: {},
    create: { name: 'Amazon', code: MallCode.amazon, apiEndpoint: 'https://sellingpartnerapi-fe.amazon.com' },
  })
  const qoo10 = await prisma.mall.upsert({
    where: { code: MallCode.qoo10 },
    update: {},
    create: { name: 'Qoo10', code: MallCode.qoo10, apiEndpoint: 'https://api.qoo10.jp' },
  })

  // Stores
  const store1 = await prisma.store.upsert({
    where: { id: 'store-rakuten-1' },
    update: {},
    create: { id: 'store-rakuten-1', mallId: rakuten.id, name: 'サンプル雑貨店 楽天', storeCode: 'sample-zakka' },
  })
  const store2 = await prisma.store.upsert({
    where: { id: 'store-yahoo-1' },
    update: {},
    create: { id: 'store-yahoo-1', mallId: yahoo.id, name: 'サンプル雑貨店 Yahoo', storeCode: 'sample-zakka-y' },
  })
  const store3 = await prisma.store.upsert({
    where: { id: 'store-amazon-1' },
    update: {},
    create: { id: 'store-amazon-1', mallId: amazon.id, name: 'Sample Zakka Amazon', storeCode: 'AMZN-SZ-001' },
  })
  const store4 = await prisma.store.upsert({
    where: { id: 'store-qoo10-1' },
    update: {},
    create: { id: 'store-qoo10-1', mallId: qoo10.id, name: 'サンプル雑貨店 Qoo10', storeCode: 'SZ-Q10' },
  })

  // Customers
  const customers = await Promise.all([
    prisma.customer.create({ data: { mallId: rakuten.id, name: '田中 恵子', email: 'keiko.tanaka@example.com', phone: '090-1234-5678' } }),
    prisma.customer.create({ data: { mallId: yahoo.id, name: '山田 浩二', email: 'koji.yamada@example.com', phone: '080-9876-5432' } }),
    prisma.customer.create({ data: { mallId: amazon.id, name: '佐藤 美咲', email: 'misaki.sato@example.com' } }),
    prisma.customer.create({ data: { mallId: qoo10.id, name: '鈴木 健太', email: 'kenta.suzuki@example.com', phone: '070-1111-2222' } }),
    prisma.customer.create({ data: { mallId: rakuten.id, name: '高橋 奈々', email: 'nana.takahashi@example.com' } }),
    prisma.customer.create({ data: { mallId: yahoo.id, name: '伊藤 龍一', email: 'ryuichi.ito@example.com', phone: '090-3333-4444' } }),
  ])

  // Orders with items and shipments
  const orderData = [
    {
      id: 'order-1',
      storeId: store1.id,
      customerId: customers[0].id,
      externalOrderId: 'RTN-2024-001234',
      orderDate: new Date('2024-12-01'),
      totalAmount: 5800,
      status: '配送中',
      paymentMethod: 'クレジットカード',
      shippingAddress: { zip: '150-0001', prefecture: '東京都', city: '渋谷区', address1: '神南1-2-3', name: '田中 恵子' },
      items: [{ productName: 'おしゃれキャンドルセット', quantity: 1, unitPrice: 3800 }, { productName: 'アロマディフューザー', quantity: 1, unitPrice: 2000 }],
      shipment: { shippingCompany: 'ヤマト運輸', trackingNumber: '1234-5678-9012', status: '配送中', shippedAt: new Date('2024-12-03') },
    },
    {
      id: 'order-2',
      storeId: store2.id,
      customerId: customers[1].id,
      externalOrderId: 'YAH-2024-009876',
      orderDate: new Date('2024-12-05'),
      totalAmount: 12000,
      status: '配送完了',
      paymentMethod: 'PayPay',
      shippingAddress: { zip: '530-0001', prefecture: '大阪府', city: '大阪市北区', address1: '梅田2-4-6', name: '山田 浩二' },
      items: [{ productName: 'プレミアムティーセット', quantity: 2, unitPrice: 6000 }],
      shipment: { shippingCompany: '佐川急便', trackingNumber: '2345678901', status: '配達完了', shippedAt: new Date('2024-12-06'), deliveredAt: new Date('2024-12-08') },
    },
    {
      id: 'order-3',
      storeId: store3.id,
      customerId: customers[2].id,
      externalOrderId: 'AMZ-2024-555666',
      orderDate: new Date('2024-12-08'),
      totalAmount: 3200,
      status: '処理中',
      paymentMethod: 'Amazon Pay',
      shippingAddress: { zip: '460-0001', prefecture: '愛知県', city: '名古屋市中区', address1: '栄1-1-1', name: '佐藤 美咲' },
      items: [{ productName: 'ナチュラルソープ 3個セット', quantity: 1, unitPrice: 3200 }],
      shipment: null,
    },
    {
      id: 'order-4',
      storeId: store4.id,
      customerId: customers[3].id,
      externalOrderId: 'Q10-2024-777888',
      orderDate: new Date('2024-12-10'),
      totalAmount: 8900,
      status: '返品処理中',
      paymentMethod: 'クレジットカード',
      shippingAddress: { zip: '810-0001', prefecture: '福岡県', city: '福岡市中央区', address1: '天神2-3-4', name: '鈴木 健太' },
      items: [{ productName: 'ハンドメイドバッグ', quantity: 1, unitPrice: 8900 }],
      shipment: { shippingCompany: '日本郵便', trackingNumber: 'JP123456789', status: '配達完了', shippedAt: new Date('2024-12-11'), deliveredAt: new Date('2024-12-13') },
    },
    {
      id: 'order-5',
      storeId: store1.id,
      customerId: customers[4].id,
      externalOrderId: 'RTN-2024-002345',
      orderDate: new Date('2024-12-12'),
      totalAmount: 2500,
      status: '配送中',
      paymentMethod: '代金引換',
      shippingAddress: { zip: '060-0001', prefecture: '北海道', city: '札幌市中央区', address1: '北1条西2丁目', name: '高橋 奈々' },
      items: [{ productName: 'オーガニックハーブティー', quantity: 1, unitPrice: 2500 }],
      shipment: { shippingCompany: 'ヤマト運輸', trackingNumber: '9876-5432-1098', status: '配送中', shippedAt: new Date('2024-12-14') },
    },
    {
      id: 'order-6',
      storeId: store2.id,
      customerId: customers[5].id,
      externalOrderId: 'YAH-2024-010101',
      orderDate: new Date('2024-12-13'),
      totalAmount: 15600,
      status: '発送準備中',
      paymentMethod: 'クレジットカード',
      shippingAddress: { zip: '980-0001', prefecture: '宮城県', city: '仙台市青葉区', address1: '中央1-1-1', name: '伊藤 龍一' },
      items: [{ productName: 'ガラス食器セット 6点', quantity: 1, unitPrice: 12000 }, { productName: '箸セット', quantity: 3, unitPrice: 1200 }],
      shipment: null,
    },
  ]

  const orders: any[] = []
  for (const od of orderData) {
    const { items, shipment, ...orderFields } = od
    const order = await prisma.order.create({
      data: {
        ...orderFields,
        items: { create: items.map(i => ({ ...i, productId: `PROD-${Math.random().toString(36).slice(2, 8)}` })) },
        ...(shipment ? { shipments: { create: shipment } } : {}),
      },
    })
    orders.push(order)
  }

  // Template categories
  const cats = await Promise.all([
    prisma.templateCategory.create({ data: { name: '配送関連', sortOrder: 1 } }),
    prisma.templateCategory.create({ data: { name: '返品・キャンセル', sortOrder: 2 } }),
    prisma.templateCategory.create({ data: { name: '商品関連', sortOrder: 3 } }),
    prisma.templateCategory.create({ data: { name: '注文・支払い', sortOrder: 4 } }),
    prisma.templateCategory.create({ data: { name: 'その他', sortOrder: 5 } }),
  ])

  // Templates
  const templates = await Promise.all([
    prisma.replyTemplate.create({
      data: {
        title: '商品未着のお詫びと対応案内',
        categoryId: cats[0].id,
        body: `{{customer_name}} 様

この度は{{store_name}}にてお買い上げいただき、誠にありがとうございます。

ご注文（注文番号：{{order_id}}）の商品がまだお手元に届いていないとのことで、大変ご不便をおかけして申し訳ございません。

現在の配送状況を確認したところ、{{shipping_company}}にて配送中でございます。
追跡番号：{{tracking_number}}

引き続き状況を確認し、改めてご連絡いたします。
ご不便をおかけして誠に申し訳ございません。

{{store_name}} カスタマーサポート`,
        usageConditions: '商品が未着の場合に使用',
        notes: '配送業者に問い合わせ後、状況を確認してから送付すること',
        applicableMalls: ['rakuten', 'yahoo', 'amazon', 'qoo10'],
        variables: ['customer_name', 'store_name', 'order_id', 'shipping_company', 'tracking_number'],
        isFavorite: true,
        createdById: admin.id,
      },
    }),
    prisma.replyTemplate.create({
      data: {
        title: '返品受付・手順案内',
        categoryId: cats[1].id,
        body: `{{customer_name}} 様

この度はご不満をおかけし、誠に申し訳ございません。

返品のご希望を承りました。以下の手順でお手続きをお願いいたします。

【返品手順】
1. 商品を未開封・未使用の状態で梱包してください
2. 同封の返品伝票をお貼りください（別途メールにてお送りします）
3. お近くのコンビニまたは郵便局よりご発送ください

返品送料：{{return_fee}}

商品確認後、1週間以内に返金処理を行います。
ご不便をおかけして大変申し訳ございません。

{{store_name}} カスタマーサポート`,
        usageConditions: '返品希望の場合に使用',
        notes: '返品理由（お客様都合か不良品か）によって返送料負担が変わるため確認必須',
        applicableMalls: ['rakuten', 'yahoo', 'amazon', 'qoo10'],
        variables: ['customer_name', 'store_name', 'return_fee'],
        isFavorite: true,
        createdById: admin.id,
      },
    }),
    prisma.replyTemplate.create({
      data: {
        title: 'キャンセル受付',
        categoryId: cats[1].id,
        body: `{{customer_name}} 様

ご注文（注文番号：{{order_id}}）のキャンセルを承りました。

返金処理は3〜5営業日以内に完了する予定です。
ご利用のお支払い方法によって反映までのお時間が異なる場合がございます。

またのご利用を心よりお待ちしております。

{{store_name}} カスタマーサポート`,
        usageConditions: '発送前のキャンセルに使用',
        notes: '発送済みの場合は別テンプレートを使用すること',
        applicableMalls: ['rakuten', 'yahoo', 'amazon', 'qoo10'],
        variables: ['customer_name', 'order_id', 'store_name'],
        isFavorite: false,
        createdById: admin.id,
      },
    }),
    prisma.replyTemplate.create({
      data: {
        title: '配送遅延のお詫び',
        categoryId: cats[0].id,
        body: `{{customer_name}} 様

この度はご注文（注文番号：{{order_id}}）の配送が遅れており、大変ご迷惑をおかけしております。

現在、{{shipping_company}}にて輸送中でございます。
追跡番号：{{tracking_number}}

お届けまでもうしばらくお待ちいただけますようお願い申し上げます。
引き続きご不便をおかけして誠に申し訳ございません。

{{store_name}} カスタマーサポート`,
        usageConditions: '配送遅延の問い合わせに使用',
        applicableMalls: ['rakuten', 'yahoo', 'amazon', 'qoo10'],
        variables: ['customer_name', 'order_id', 'shipping_company', 'tracking_number', 'store_name'],
        isFavorite: false,
        createdById: admin.id,
      },
    }),
    prisma.replyTemplate.create({
      data: {
        title: '初期不良対応',
        categoryId: cats[2].id,
        body: `{{customer_name}} 様

この度はご購入いただいた商品に不具合があり、誠に申し訳ございません。

つきましては、以下のいずれかの対応をさせていただきます。

① 代替品の発送
② 返金対応

ご希望の対応をお知らせください。
また、お手数ですが不具合箇所の写真をお送りいただけると幸いです。

{{store_name}} カスタマーサポート`,
        usageConditions: '商品の初期不良・破損の場合に使用',
        notes: '写真確認後に対応方針を決定すること',
        applicableMalls: ['rakuten', 'yahoo', 'amazon', 'qoo10'],
        variables: ['customer_name', 'store_name'],
        isFavorite: true,
        createdById: admin.id,
      },
    }),
    prisma.replyTemplate.create({
      data: {
        title: '領収書発行案内',
        categoryId: cats[3].id,
        body: `{{customer_name}} 様

領収書発行のご依頼を承りました。

【領収書情報】
注文番号：{{order_id}}
金額：ご注文合計金額
宛名：ご指定の場合はお知らせください

PDF形式にて発行し、ご登録のメールアドレスへお送りいたします。
通常2〜3営業日以内に対応いたします。

{{store_name}} カスタマーサポート`,
        usageConditions: '領収書発行依頼の場合に使用',
        applicableMalls: ['rakuten', 'yahoo'],
        variables: ['customer_name', 'order_id', 'store_name'],
        isFavorite: false,
        createdById: admin.id,
      },
    }),
  ])

  // Inquiries with messages
  const inquiryData = [
    {
      storeId: store1.id,
      customerId: customers[0].id,
      orderId: orders[0].id,
      inquiryType: InquiryType.not_arrived,
      status: InquiryStatus.unread,
      subject: '注文した商品がまだ届きません',
      assignedToId: staff1.id,
      receivedAt: new Date('2024-12-15T10:30:00'),
      messages: [
        { senderType: 'customer', senderName: '田中 恵子', body: 'こんにちは。先週注文した「おしゃれキャンドルセット」と「アロマディフューザー」がまだ届きません。注文番号はRTN-2024-001234です。いつ届きますか？', sentAt: new Date('2024-12-15T10:30:00') },
      ],
    },
    {
      storeId: store2.id,
      customerId: customers[1].id,
      orderId: orders[1].id,
      inquiryType: InquiryType.return,
      status: InquiryStatus.pending,
      subject: '商品の返品をしたいのですが',
      assignedToId: staff2.id,
      receivedAt: new Date('2024-12-14T14:20:00'),
      messages: [
        { senderType: 'customer', senderName: '山田 浩二', body: '購入したプレミアムティーセットですが、イメージと違ったため返品したいと思います。返品方法を教えていただけますか？', sentAt: new Date('2024-12-14T14:20:00') },
        { senderType: 'staff', senderName: '担当 花子', body: '山田様、ご連絡いただきありがとうございます。返品の件、承りました。詳細を確認の上、改めてご連絡いたします。', sentAt: new Date('2024-12-14T15:00:00') },
      ],
    },
    {
      storeId: store3.id,
      customerId: customers[2].id,
      orderId: orders[2].id,
      inquiryType: InquiryType.defect,
      status: InquiryStatus.needs_check,
      subject: '届いた商品が破損していました',
      assignedToId: null,
      receivedAt: new Date('2024-12-13T09:15:00'),
      messages: [
        { senderType: 'customer', senderName: '佐藤 美咲', body: 'ナチュラルソープ3個セットを注文しましたが、届いたら箱が潰れていて中の商品も一部破損していました。写真を添付します。対応をお願いします。', sentAt: new Date('2024-12-13T09:15:00') },
      ],
    },
    {
      storeId: store4.id,
      customerId: customers[3].id,
      orderId: orders[3].id,
      inquiryType: InquiryType.customer_return,
      status: InquiryStatus.replied,
      subject: 'お客様都合による返品について',
      assignedToId: staff1.id,
      receivedAt: new Date('2024-12-12T16:45:00'),
      messages: [
        { senderType: 'customer', senderName: '鈴木 健太', body: 'ハンドメイドバッグを購入しましたが、サイズが合わなかったため返品したいです。返品できますか？', sentAt: new Date('2024-12-12T16:45:00') },
        { senderType: 'staff', senderName: '担当 次郎', body: '鈴木様、ご連絡いただきありがとうございます。お客様都合による返品は、未使用・タグ付きの状態に限り承っております。返品の際の送料はお客様負担となります。ご了承いただける場合は返品先住所をお知らせします。', sentAt: new Date('2024-12-13T10:00:00') },
        { senderType: 'customer', senderName: '鈴木 健太', body: 'わかりました。返品先住所を教えてください。', sentAt: new Date('2024-12-13T11:30:00') },
        { senderType: 'staff', senderName: '担当 次郎', body: '返品先：〒150-0001 東京都渋谷区神南1-2-3 サンプル雑貨店 返品受付係 宛　にご発送ください。到着後1週間以内に返金手続きを行います。', sentAt: new Date('2024-12-13T14:00:00') },
      ],
    },
    {
      storeId: store1.id,
      customerId: customers[4].id,
      orderId: orders[4].id,
      inquiryType: InquiryType.address_change,
      status: InquiryStatus.unread,
      subject: '配送先住所の変更をお願いしたい',
      assignedToId: null,
      receivedAt: new Date('2024-12-15T08:00:00'),
      messages: [
        { senderType: 'customer', senderName: '高橋 奈々', body: '注文後に引越しが決まりました。配送先住所を変更できますか？新しい住所は〒150-0002 東京都渋谷区渋谷1-1-1です。', sentAt: new Date('2024-12-15T08:00:00') },
      ],
    },
    {
      storeId: store2.id,
      customerId: customers[5].id,
      orderId: orders[5].id,
      inquiryType: InquiryType.cancel,
      status: InquiryStatus.unread,
      subject: '注文キャンセルをお願いします',
      assignedToId: staff2.id,
      receivedAt: new Date('2024-12-15T11:00:00'),
      messages: [
        { senderType: 'customer', senderName: '伊藤 龍一', body: '先ほど注文したガラス食器セットをキャンセルしたいです。まだ発送されていないと思うのですが、キャンセルできますか？', sentAt: new Date('2024-12-15T11:00:00') },
      ],
    },
  ]

  for (const iq of inquiryData) {
    const { messages, ...iqFields } = iq
    await prisma.inquiry.create({
      data: {
        ...iqFields,
        messages: { create: messages },
      },
    })
  }

  console.log('✅ Seed complete!')
  console.log('📧 Admin: admin@example.com / admin1234')
  console.log('📧 Staff: staff1@example.com / staff1234')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
