-- Audrita Mukherjee — The Quiet Garden
-- Supabase Schema for Personal Poetry Archive
-- Run this in your Supabase Project SQL Editor (https://supabase.com/dashboard/project/_/sql)

create table if not exists public.poems (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  language text not null default 'english', -- 'english' or 'hindi'
  tag text not null default 'Memory & Solitude',
  verse text not null,
  date text not null,
  notes text,
  is_favorite boolean default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.poems enable row level security;

-- Policy 1: Anyone with the project anon key can read published poems
create policy "Public can read poems"
  on public.poems
  for select
  using (true);

-- Policy 2: Allow insert for anon/authenticated (protected by your Vercel deployment)
create policy "Allow insert poems"
  on public.poems
  for insert
  with check (true);

-- Canonical poems by Audrita Mukherjee
insert into public.poems (title, language, tag, verse, date) values
(
  'Favor',
  'english',
  'Memory & The Ganges',
  'Do me a favor, will you please?
Take his wedding picture
Clad in white
In my land
White is not just celebration
It is what we wrap our loved ones in
Before we give them to the fire

Do me a favor, will you please?
Bring me the ashes from the fire
That stood witness to his next life
I will carry it to the Ganges
And release what loved him quietly,
Faithfully,
Without a name

And that will be my last gift to him.',
  'Audrita Mukherjee'
),
(
  'मक़्तूब / Maktub',
  'hindi',
  'मक़्तूब & राम रेखा',
  'ये कैसा वरदान दिया रब ने
चाहे कितनी गाँठों से बाँधे ये दरवाज़े,
सीली लकीरों से ये दीवारें,
दस्तक आने में देर न लगती।

और कहीं पुरानी आदतों से रह जाए कोई किवाड़ खुली,
तो घुस आते मेहमान नए।
घर के चौराहे से आती ख़ुशबू इतनी,
गुलाब और पीले फूलों से महकता बग़ीचा,
बरगद की छाँव की ठंडक,
और घरवाली की दया से रखा हुआ वो मीठा पानी,
बाहर की कड़ी धूप में सबको मोह लेता।

आने को तो सब आते हैं
घर का राशन, पानी, चाव से खाते।
और जब वो माक़्तूब मानकर
उनके आगे के सफ़र के लिए पोटलियों में खाना बाँध देती,
कुछ हसीन यादें भी छोड़ देती
"माक़्तूब है ये," मानकर, उन्हें अलविदा कह देती।

हर कोई दस्तक देता चला आता
पर किसी ने अंदरवाले से मिलकर पूछा ही नहीं।
शायद उन्हें लगता था इसके पास भला किस बात की कमी होगी?
सब आते-जाते रहे।
कोई ठहरा नहीं।

घरवाली अनुभव की सीढ़ियाँ चढ़ती गई
हर पायदान पर थोड़ी और ख़ाली होती।
एहसास हुआ अब कोई ठहरने नहीं आएगा—
पर उस दिन उसने किवाड़ बंद नहीं किए
उसने राम का नाम लिया।
और देहलीज़ पर एक लकीर खींच दी।

ये लक्ष्मण रेखा नहीं थी,
जो कोई और उसके लिए खींच जाए,
ये राम रेखा थी,
अपने ही केंद्र से खींची हुई।

धीरे-धीरे विश्वास की जड़ें फिर से पकड़ने लगीं।
कमरों से उन छलिया परछाइयों की यादें
आँसुओं में घुलने लगीं
बहती रहीं वो यादें, आँसुओं के साथ देहलीज़ के पार।
और जब सब बह गया
बस प्रेम रहा, बस राम रहे।

कुछ दिन आँगन ख़ामोश था,
देहलीज़ चुप रही।
आँगन फिर से महक उठा।
गुलाब की झाड़ियाँ फिर खिलीं,
अमरूद के पेड़ों पर भँवरे लौट आए।

अब भी दस्तक आती है।
पर देहलीज़ पूछती है,
"तुम राशन माँगने आए हो, या ठहरने?"

जो पार कर सके वो रेखा, वही अंदर आता है।
बाक़ी लौट जाते हैं।
घरवाली अब भी राम का नाम जपती है
पर अब वो नाम दरवाज़ा नहीं खोलता,
उसे थामे रखता है।

ख़ुद ही ख़ुद को वरदान दिया उसने।',
  'औद्रिता मुखर्जी'
);
