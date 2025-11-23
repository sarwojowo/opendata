from flask import render_template, flash, redirect, url_for, request
from werkzeug.utils import secure_filename
from app.models.Dataset import *
from app.models.Detail import *
import os
import pandas as pd
import numpy as np

# konfigurasi file
conf = {
    'UPLOAD_EXTENSIONS': ['.csv']
}

def index():
    data = Dataset.get().serialize()
    return render_template('pages/dataset/index.html', data=data, segment='dataset')

def create():
	return render_template('pages/dataset/create.html', segment='dataset')

def store(request):
    post = request.form # Berisi data dari form HTML

    checkNamaData = Dataset.get_by_nama(post['nama_data'])
    if checkNamaData == None:
        # Menyimpan nama_data kedalam database
        dataset = Dataset()
        dataset.nama_data = post['nama_data']
        dataset.save()
        
        uploaded_file = request.files['file']
        filename      = secure_filename(uploaded_file.filename)

        file_ext = os.path.splitext(filename)[1]
        if file_ext not in conf['UPLOAD_EXTENSIONS']:
            flash('Tipe file tidak sesuai!', 'danger')
            return redirect(url_for('dataset_index'))

        # Upload file to static with new name
        uploaded_file.save("static/import_data" + file_ext)

        # Read uploaded file
        df = pd.read_csv("static/import_data.csv", delimiter=',')
        df = df.replace(np.nan, 'EMPTY')
        print(df)

        # Mengonversi 'Date' ke datetime
        df['Date'] = pd.to_datetime(df["Date"], format="%Y-%m-%d")

        # Mengambil hanya bagian tanggal
        df['Date'] = df['Date'].dt.date

        for index, row in df.iterrows():
            print(row['Date'])
            print('Execute index ', index, end='... ')
            tmp_store = {
                'dataset_id' : dataset.serialize()['id'],
                'date'       : row['Date'],
                'open'       : row['Open'],
                'high'       : row['High'],
                'low'        : row['Low'],
                'close'      : row['Close'],
                'volume'     : row['Volume'],
            }
            Detail.insert(tmp_store)
            print('Done.')
        flash('Data berhasil disimpan.', 'success')
        return redirect(url_for('dataset_index'))
    else:
        flash('Data sudah tersedia.', 'danger')
        return redirect(url_for('dataset_index'))

def detail_data(id):
    nama_data = Dataset.where('id', id).select('nama_data').first().serialize()
    data      = Detail.where('dataset_id', id).order_by('date', 'desc').get().serialize()
    return render_template('pages/dataset/detail.html', data=data, nama_data=nama_data, segment='dataset')

def delete(id):
    try:
        delete = Dataset.find(id).delete()
        del_detail = Detail.where('dataset_id', id).delete()
        flash('Data berhasil di hapus.', 'success')
        return redirect(url_for("dataset_index"))
    except Exception as e:
        return 'Something went wrong ' + str(e)

def dataset_reset():
    # Hapus semua detail dulu karena ada FK ke Dataset
    Detail.query().delete()      # gunakan .delete(), bukan .truncate()
    Dataset.query().delete()
    
    flash('Data berhasil direset.', 'success')
    return redirect(url_for('dataset_index'))

