from flask import render_template, request
from app.models.Dataset import *
from app.models.Detail import *
from sklearn.preprocessing import MinMaxScaler
import pandas as pd
import numpy as np
from sklearn.svm import SVR
from sklearn.metrics import mean_squared_error, mean_absolute_percentage_error
from sklearn.linear_model import LinearRegression
from datetime import timedelta

def index():
    list_data   = Dataset.get().serialize()
    show_data   = 0
    nama_data   = ''
    df_train    = ''
    df_test     = ''
    df_evaluasi = ''
    df_next     = ''

    if len(request.args) > 0:
        show_data = 1
        nama_data = request.args['namaData']

        dataset = Dataset.where('nama_data', nama_data).first().serialize()
        detailData = Detail.where('dataset_id', dataset['id']).get().serialize()

        df = pd.DataFrame(detailData)
        df = df.drop(columns=['id', 'dataset_id', 'created_at', 'updated_at', 'deleted_at'])
        df = df.dropna().reset_index(drop=True)
        # df = df.tail(7)
        print(df)

        # Ubah kolom Date menjadi datetime
        df['date'] = pd.to_datetime(df['date'], format='%Y-%m-%d')

        df_select = df[['close', 'high', 'low', 'open', 'volume']]

        # --------------- Min-Max Normalization ---------------
        # Inisialisasi MinMaxScaler
        scaler = MinMaxScaler()

        # Fit dan transform data
        scaled = scaler.fit_transform(df_select.values)
        # Mengubah hasil kembali ke DataFrame
        df_scaled = pd.DataFrame(scaled, columns=df_select.columns, index=df_select.index)
        print(df_scaled)

        # --------------- Split Data --------------
        # Target: kolom 'close', Fitur: lainnya
        X = df_scaled.drop(columns=['close'])
        y = df_scaled['close']

        test_split = 0.2
        split_size = int(len(df) * (1-test_split))
        X_train, X_test, y_train, y_test = make_train_test_splits(X, y, split_size)

        print('Jumlah data training :', len(X_train))
        print('Jumlah data testing  :', len(X_test))

        # --------------------------- SVR ------------------------------------------------
        # ================================================
        # Inisialisasi model SVR kernel rbf
        svr_rbf = SVR(kernel='rbf', C=3, epsilon=0.001)
        # Training
        svr_rbf.fit(X_train, y_train)
        # Prediksi
        y_pred_rbf = svr_rbf.predict(X_test)

        # ================================================
        # Inisialisasi model SVR kernel linear
        svr_linear = SVR(kernel='linear', C=3, epsilon=0.001)
        # Training
        svr_linear.fit(X_train, y_train)
        # Prediksi
        y_pred_linear = svr_linear.predict(X_test)

        # ================================================
        # Inisialisasi model SVR kernel polynomial
        svr_poly = SVR(kernel='poly', C=3, epsilon=0.001)
        # Training
        svr_poly.fit(X_train, y_train)
        # Prediksi
        y_pred_poly = svr_poly.predict(X_test)

        # ================================================
        # Inisialisasi model SVR kernel sigmoid
        svr_sigmoid = SVR(kernel='sigmoid', C=3, epsilon=0.001)
        # Training
        svr_sigmoid.fit(X_train, y_train)
        # Prediksi
        y_pred_sigmoid = svr_sigmoid.predict(X_test)

        # --------------------------- LINEAR REGRESSION ------------------------------------------------
        # Inisialisasi model LR
        lr = LinearRegression()
        # Training
        lr.fit(X_train, y_train)
        # Prediksi
        y_pred_lr = lr.predict(X_test)

        # Ambil kolom date dan konversi ke format hanya tanggal
        df['date'] = pd.to_datetime(df['date']).dt.date

        dates = df['date'].reset_index(drop=True)

        # Bagi date ke train dan test
        # date_train = dates[:int(len(dates)*(1 - test_split))]
        date_test  = dates[int(len(dates)*(1 - test_split)) + 1:]

        # Ubah y_train jadi Series
        y_train_df = pd.Series(y_train).reset_index(drop=True)

        # Ubah X_train jadi DataFrame
        X_train_df = pd.DataFrame(X_train).reset_index(drop=True)

        # Gabungkan y dan X secara horizontal (axis=1)
        train_combined_scaled = pd.concat([y_train_df, X_train_df], axis=1)


        # Sama untuk test
        y_test_df = pd.Series(y_test).reset_index(drop=True)
        X_test_df = pd.DataFrame(X_test).reset_index(drop=True)

        test_combined_scaled = pd.concat([y_test_df, X_test_df], axis=1)

        # Kembalikan ke nilai asli
        train_combined_inverse = scaler.inverse_transform(train_combined_scaled)
        test_combined_inverse  = scaler.inverse_transform(test_combined_scaled)

        # Buat DataFrame dan tambahkan kolom tanggal
        df_train = pd.DataFrame(train_combined_inverse, columns=['close', 'high', 'low', 'open', 'volume'])
        # df_train['date'] = date_train.values
        print(df_train)

        df_test = pd.DataFrame(test_combined_inverse, columns=['close', 'high', 'low', 'open', 'volume'])
        df_test['date'] = date_test.values
        print(df_test)

        # Inverse prediksi ke skala asli
        # df_test['Pred_SVR_RBF']          = scaler.inverse_transform(np.column_stack([y_pred_rbf, X_test]))[:, 0]
        # df_test['Pred_SVR_Linear']       = scaler.inverse_transform(np.column_stack([y_pred_linear, X_test]))[:, 0]
        # df_test['Pred_SVR_Poly']         = scaler.inverse_transform(np.column_stack([y_pred_poly, X_test]))[:, 0]
        # df_test['Pred_SVR_Sigmoid']      = scaler.inverse_transform(np.column_stack([y_pred_sigmoid, X_test]))[:, 0]
        # df_test['Pred_LinearRegression'] = scaler.inverse_transform(np.column_stack([y_pred_lr, X_test]))[:, 0]

        df_test['Pred_SVR_RBF'] = np.round(
            scaler.inverse_transform(np.column_stack([y_pred_rbf, X_test]))[:, 0]
        ).astype(int)

        df_test['Pred_SVR_Linear'] = np.round(
            scaler.inverse_transform(np.column_stack([y_pred_linear, X_test]))[:, 0]
        ).astype(int)

        df_test['Pred_SVR_Poly'] = np.round(
            scaler.inverse_transform(np.column_stack([y_pred_poly, X_test]))[:, 0]
        ).astype(int)

        df_test['Pred_SVR_Sigmoid'] = np.round(
            scaler.inverse_transform(np.column_stack([y_pred_sigmoid, X_test]))[:, 0]
        ).astype(int)

        df_test['Pred_LinearRegression'] = np.round(
            scaler.inverse_transform(np.column_stack([y_pred_lr, X_test]))[:, 0]
        ).astype(int)


        # Urutkan df_test berdasarkan kolom 'date' descending (tanggal terbaru di atas)
        df_test = df_test.sort_values(by='date', ascending=False).reset_index(drop=True)

        # Menghitung MAPE dan RMSE untuk Pred_SVR_RBF
        mape_rbf = mean_absolute_percentage_error(df_test['close'], df_test['Pred_SVR_RBF']) * 100
        rmse_rbf = np.sqrt(mean_squared_error(df_test['close'], df_test['Pred_SVR_RBF']))
        print("Evaluasi untuk Pred_SVR_RBF:")
        print(f"MAPE: {mape_rbf:.2f}%")
        print(f"RMSE: {rmse_rbf:.4f}")
        print("-" * 40)

        # Menghitung MAPE dan RMSE untuk Pred_SVR_Linear
        mape_linear = mean_absolute_percentage_error(df_test['close'], df_test['Pred_SVR_Linear']) * 100
        rmse_linear = np.sqrt(mean_squared_error(df_test['close'], df_test['Pred_SVR_Linear']))
        print("Evaluasi untuk Pred_SVR_Linear:")
        print(f"MAPE: {mape_linear:.2f}%")
        print(f"RMSE: {rmse_linear:.4f}")
        print("-" * 40)

        # Menghitung MAPE dan RMSE untuk Pred_SVR_Poly
        mape_poly = mean_absolute_percentage_error(df_test['close'], df_test['Pred_SVR_Poly']) * 100
        rmse_poly = np.sqrt(mean_squared_error(df_test['close'], df_test['Pred_SVR_Poly']))
        print("Evaluasi untuk Pred_SVR_Poly:")
        print(f"MAPE: {mape_poly:.2f}%")
        print(f"RMSE: {rmse_poly:.4f}")
        print("-" * 40)

        # Menghitung MAPE dan RMSE untuk Pred_SVR_Sigmoid
        mape_sigmoid = mean_absolute_percentage_error(df_test['close'], df_test['Pred_SVR_Sigmoid']) * 100
        rmse_sigmoid = np.sqrt(mean_squared_error(df_test['close'], df_test['Pred_SVR_Sigmoid']))
        print("Evaluasi untuk Pred_SVR_Sigmoid:")
        print(f"MAPE: {mape_sigmoid:.2f}%")
        print(f"RMSE: {rmse_sigmoid:.4f}")
        print("-" * 40)

        # Menghitung MAPE dan RMSE untuk Pred_LinearRegression
        mape_lr = mean_absolute_percentage_error(df_test['close'], df_test['Pred_LinearRegression']) * 100
        rmse_lr = np.sqrt(mean_squared_error(df_test['close'], df_test['Pred_LinearRegression']))
        print("Evaluasi untuk Pred_LinearRegression:")
        print(f"MAPE: {mape_lr:.2f}%")
        print(f"RMSE: {rmse_lr:.4f}")
        print("-" * 40)

        df_evaluasi = pd.DataFrame({
            'algoritma': ['SVR - Kernel RBF', 'SVR - Kernel Linear', 'SVR - Kernel Polynomial', 'SVR - Kernel Sigmoid', 'Linear Regression'],
            'mape'     : [mape_rbf, mape_linear, mape_poly, mape_sigmoid, mape_lr],
            'rmse'     : [rmse_rbf, rmse_linear, rmse_poly, rmse_sigmoid, rmse_lr],
        })

        # ------------------- PREDIKSI 1 HARI SELANJUTNYA -----------------------------------
        # Ambil data terakhir dari df_scaled untuk prediksi hari selanjutnya
        last_scaled_features = df_scaled[['high', 'low', 'open', 'volume']].iloc[-1:].values

        # Prediksi nilai 'close' hari berikutnya
        next_pred_rbf     = svr_rbf.predict(last_scaled_features)
        next_pred_linear  = svr_linear.predict(last_scaled_features)
        next_pred_poly    = svr_poly.predict(last_scaled_features)
        next_pred_sigmoid = svr_sigmoid.predict(last_scaled_features)
        next_pred_lr      = lr.predict(last_scaled_features)

        # Gabungkan prediksi dengan fitur untuk inverse_transform
        rbf_inv     = scaler.inverse_transform(np.column_stack([next_pred_rbf, last_scaled_features]))[0]
        linear_inv  = scaler.inverse_transform(np.column_stack([next_pred_linear, last_scaled_features]))[0]
        poly_inv    = scaler.inverse_transform(np.column_stack([next_pred_poly, last_scaled_features]))[0]
        sigmoid_inv = scaler.inverse_transform(np.column_stack([next_pred_sigmoid, last_scaled_features]))[0]
        lr_inv      = scaler.inverse_transform(np.column_stack([next_pred_lr, last_scaled_features]))[0]

        # Tentukan tanggal prediksi: hari setelah tanggal terakhir
        next_date = df['date'].max() + timedelta(days=1)

        # Jika next_date adalah Sabtu (5) atau Minggu (6), lompat ke Senin
        if next_date.weekday() == 5:  # Sabtu
            next_date += timedelta(days=2)
        elif next_date.weekday() == 6:  # Minggu
            next_date += timedelta(days=1)

        # Buat DataFrame untuk hasil prediksi
        df_next = pd.DataFrame({
            'date': [next_date],
            'Pred_SVR_RBF': [round(rbf_inv[0])],
            'Pred_SVR_Linear': [round(linear_inv[0])],
            'Pred_SVR_Poly': [round(poly_inv[0])],
            'Pred_SVR_Sigmoid': [round(sigmoid_inv[0])],
            'Pred_LinearRegression': [round(lr_inv[0])],
        })

        print("\nPrediksi untuk 1 hari ke depan (tanpa Sabtu/Minggu):")
        print(df_next)
        
    return render_template('pages/algoritma.html', segment='algoritma', list_data=list_data, nama_data=nama_data, 
                           df_train=df_train, df_test=df_test, show_data=show_data, df_evaluasi=df_evaluasi, df_next=df_next)

# Membuat fungsi untuk membagi data menjadi training dan testing
def make_train_test_splits(X, y, split_size):
    # Pastikan X dan y adalah DataFrame atau array yang sudah urut berdasarkan waktu
    # Shift y satu langkah ke atas (ke depan) supaya y[t] adalah harga close hari setelah fitur X[t]
    y_shifted = y.shift(-1)  # Jika y DataFrame/Series pandas
    # Buang data terakhir yg tidak punya y (karena shift -1)
    X = X[:-1]
    y_shifted = y_shifted[:-1]

    # Konversi ke numpy array jika perlu
    X = X.values if hasattr(X, "values") else X
    y_shifted = y_shifted.values if hasattr(y_shifted, "values") else y_shifted

    # Split train-test
    X_train = X[:split_size]
    y_train = y_shifted[:split_size]
    X_test = X[split_size:]
    y_test = y_shifted[split_size:]

    return X_train, X_test, y_train, y_test

# Fungsi MAPE manual
def mape(y_test, pred):
    y_test, pred = np.array(y_test), np.array(pred)
    mape = np.mean(np.abs((y_test - pred) / y_test))
    return round(mape * 100, 2)

# Fungsi RMSE manual
def rmse(y_test, pred):
    return round(np.sqrt(np.mean((y_test - pred) ** 2)), 4)