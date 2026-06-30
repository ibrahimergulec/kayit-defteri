const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Statik dosyalar (frontend)
app.use(express.static(path.join(__dirname)));

// Supabase bağlantısı
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// ============ MÜŞTERİ İŞLEMLERİ ============

// Tüm müşterileri getir
app.get('/api/customers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name');
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tek müşteri getir
app.get('/api/customers/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Müşteri ekle
app.post('/api/customers', async (req, res) => {
  try {
    const { name, phone, address, tax_number } = req.body;
    
    const { data, error } = await supabase
      .from('customers')
      .insert([{ name, phone, address, tax_number, balance: 0 }])
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Müşteri güncelle (YENİ - DÜZENLEME İÇİN)
app.put('/api/customers/:id', async (req, res) => {
  try {
    const { name, phone, address, tax_number, balance } = req.body;
    
    const { data, error } = await supabase
      .from('customers')
      .update({ name, phone, address, tax_number, balance, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Müşteri sil
app.delete('/api/customers/:id', async (req, res) => {
  try {
    // Önce müşterinin hareketlerini sil (cascade çalışmalı ama garanti olsun)
    await supabase
      .from('transactions')
      .delete()
      .eq('customer_id', req.params.id);
    
    // Sonra müşteriyi sil
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ CARİ HAREKETLER ============

// Tüm hareketleri getir (YENİ - SYNC İÇİN)
app.get('/api/transactions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Müşterinin tüm hareketlerini getir
app.get('/api/transactions/:customerId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('customer_id', req.params.customerId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Yeni hareket ekle (Borç/Alacak)
app.post('/api/transactions', async (req, res) => {
  try {
    const { customer_id, type, amount, description, date } = req.body;
    
    // Hareket ekle
    const { data: transaction, error: transError } = await supabase
      .from('transactions')
      .insert([{ 
        customer_id, 
        type,
        amount, 
        description, 
        date: date || new Date().toISOString()
      }])
      .select()
      .single();
    
    if (transError) throw transError;
    
    // Bakiyeyi güncelle
    const { data: customer } = await supabase
      .from('customers')
      .select('balance')
      .eq('id', customer_id)
      .single();
    
    const oldBalance = parseFloat(customer.balance) || 0;
    const newBalance = type === 'debt' 
      ? oldBalance + amount 
      : oldBalance - amount;
    
    await supabase
      .from('customers')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', customer_id);
    
    res.status(201).json({ ...transaction, new_balance: newBalance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ RAPOR ============

app.get('/api/report', async (req, res) => {
  try {
    const { data: customers, error } = await supabase
      .from('customers')
      .select('name, balance, phone')
      .order('balance', { ascending: false });
    
    if (error) throw error;
    
    const totalDebt = customers.filter(c => c.balance > 0).reduce((a, c) => a + parseFloat(c.balance), 0);
    const totalCredit = customers.filter(c => c.balance < 0).reduce((a, c) => a + parseFloat(c.balance), 0);
    
    res.json({
      customers,
      summary: {
        total_debt: totalDebt,
        total_credit: Math.abs(totalCredit),
        net_balance: totalDebt + totalCredit
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ SYNC (SENKRONİZASYON) ============

app.post('/api/sync', async (req, res) => {
  try {
    const { customers: newCustomers, transactions: newTransactions } = req.body;
    
    // Toplu müşteri ekleme/güncelleme
    if (newCustomers && newCustomers.length > 0) {
      for (const customer of newCustomers) {
        const { data: existing } = await supabase
          .from('customers')
          .select('id')
          .eq('id', customer.id)
          .single();
        
        if (existing) {
          // Güncelle
          await supabase
            .from('customers')
            .update({
              name: customer.name,
              phone: customer.phone,
              address: customer.address,
              tax_number: customer.tax_number,
              balance: customer.balance,
              updated_at: customer.updated_at || new Date().toISOString()
            })
            .eq('id', customer.id);
        } else {
          // Yeni ekle
          await supabase.from('customers').insert([customer]);
        }
      }
    }
    
    // Toplu hareket ekleme
    if (newTransactions && newTransactions.length > 0) {
      for (const trans of newTransactions) {
        // Aynı ID'li hareket var mı kontrol et
        const { data: existing } = await supabase
          .from('transactions')
          .select('id')
          .eq('id', trans.id)
          .single();
        
        if (!existing) {
          await supabase.from('transactions').insert([{
            id: trans.id,
            customer_id: trans.customer_id,
            type: trans.type,
            amount: trans.amount,
            description: trans.description,
            date: trans.date,
            created_at: trans.created_at || new Date().toISOString()
          }]);
        }
      }
    }
    
    // Güncel verileri döndür
    const { data: allCustomers } = await supabase.from('customers').select('*').order('name');
    const { data: allTransactions } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    
    res.json({
      customers: allCustomers || [],
      transactions: allTransactions || [],
      sync_time: new Date().toISOString()
    });
  } catch (error) {
    console.error('Sync hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ ANA SAYFA ============

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ============ SAĞLIK KONTROLÜ ============

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', time: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ${PORT} portunda calisiyor`));
