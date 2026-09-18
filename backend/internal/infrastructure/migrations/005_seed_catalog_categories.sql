INSERT INTO categories (category_id, name) VALUES
    ('c8a55ec7-ef4e-4f61-8f17-2d3242798380', 'Mechanical'),
    ('3cb2f277-e824-467a-a562-5ec62cd9c459', 'Magnetic'),
    ('fd82f5e5-671f-4b2d-9a4d-606610d79642', 'Custom'),
    ('577a038d-29b1-481d-b55d-b09bf2b80c18', 'Keycaps'),
    ('4748a868-f286-4edb-b722-f96df85e62a9', 'Switches'),
    ('f23afa71-5e57-434f-a4ae-b9204edff917', 'Accessories')
ON CONFLICT (name) DO NOTHING;
