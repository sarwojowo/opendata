FROM odoo:14.0

USER root

RUN sed -i 's|deb.debian.org|archive.debian.org|g' /etc/apt/sources.list && \
    sed -i 's|security.debian.org|archive.debian.org|g' /etc/apt/sources.list && \
    sed -i '/buster-updates/d' /etc/apt/sources.list && \
    echo 'Acquire::Check-Valid-Until "false";' > /etc/apt/apt.conf.d/99no-check-valid-until

RUN apt-get update && apt-get install -y \
    gcc g++ make \
    python3-dev \
    libffi-dev \
    libssl-dev \
    libatlas-base-dev \
    liblapack-dev \
    gfortran \
    libxml2-dev \
    libxslt1-dev \
    zlib1g-dev \
    libjpeg-dev \
    libfreetype6-dev \
    \
    procps \
    \
    default-jre-headless \
    libreoffice-java-common \
    \
    unoconv \
    libreoffice-core \
    libreoffice-writer \
    libreoffice-common \
    fonts-liberation \
    fonts-dejavu-core \
    fontconfig \
    libgl1-mesa-glx \
    libxrender1 \
    libxext6 \
    libxt6 \
    libsm6 \
    libfontconfig1 \
    \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /var/lib/odoo/.config/libreoffice && \
    chown -R odoo:odoo /var/lib/odoo && \
    fc-cache -fv

RUN pip3 install --upgrade pip setuptools wheel

ENV CRYPTOGRAPHY_DONT_BUILD_RUST=1 \
    HOME=/var/lib/odoo 

RUN pip3 install --no-cache-dir \
    openai \
    sqlparse \
    minio \
    pandas \
    num2words \
    xlrd \
    xlsxwriter \
    openpyxl \
    xlwt \
    PyPDF2 \
    py3o.template \
    Genshi \
    dbfread \
    zeep \
    ebaysdk \
    bravado-core \
    swagger-spec-validator \
    cryptography \
    passlib \
    oauthlib \
    pyOpenSSL \
    paramiko==2.12.0 \
    pysftp==0.2.9 \
    python-dateutil \
    pytz \
    six \
    python-stdnum \
    PyYAML \
    jinja2 \
    markupsafe \
    Pillow \
    freezegun \
    pyserial \
    beautifulsoup4 \
    openupgradelib

USER odoo
